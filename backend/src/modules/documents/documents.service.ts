import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentEntity } from './entities/document.entity';
import { CreateDocumentDto } from './dto/create-document.dto';
import { StorageService } from '../../core/storage/storage.service';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(DocumentEntity)
    private readonly documentRepository: Repository<DocumentEntity>,
    private readonly storageService: StorageService,
  ) {}

  async enrichDocument(doc: DocumentEntity): Promise<any> {
    if (!doc) return doc;
    const url = doc.fileKey
      ? await this.storageService.getPresignedUrl(doc.fileKey, 604800)
      : '';
    return {
      ...doc,
      url,
    };
  }

  async findByUserId(userId: number): Promise<any[]> {
    const docs = await this.documentRepository.find({
      where: { userId },
      order: { createdAt: 'ASC' },
    });
    return Promise.all(docs.map((d) => this.enrichDocument(d)));
  }

  async createForUser(userId: number, docData: Partial<CreateDocumentDto>): Promise<any> {
    const cleanKey =
      docData.fileKey && docData.fileKey.includes('?X-Amz-')
        ? docData.fileKey.split('?')[0]
        : docData.fileKey || '';

    const newDoc = this.documentRepository.create({
      ...docData,
      userId,
      fileKey: cleanKey,
      status: docData.status || 'VERIFIED',
    });

    const saved = await this.documentRepository.save(newDoc);
    return this.enrichDocument(saved);
  }

  async createBulkForUser(
    userId: number,
    docs: Array<Partial<CreateDocumentDto>>,
  ): Promise<any[]> {
    if (!Array.isArray(docs) || docs.length === 0) {
      return [];
    }

    const savedDocs = await Promise.all(
      docs.map((d) => this.createForUser(userId, d)),
    );
    return savedDocs;
  }

  async updateStatus(
    id: number,
    status: string,
    rejectionReason?: string,
  ): Promise<any> {
    const doc = await this.documentRepository.findOne({ where: { id } });
    if (!doc) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    doc.status = status;
    if (rejectionReason !== undefined) {
      doc.rejectionReason = rejectionReason;
    }

    const updated = await this.documentRepository.save(doc);
    return this.enrichDocument(updated);
  }

  async remove(id: number): Promise<{ success: boolean; message: string }> {
    const doc = await this.documentRepository.findOne({ where: { id } });
    if (!doc) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    await this.documentRepository.remove(doc);
    return { success: true, message: `Document ID ${id} removed successfully` };
  }
}
