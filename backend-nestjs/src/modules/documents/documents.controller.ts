import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { Permission } from '../../common/enums/permission.enum';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get('user/:userId')
  async findByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return this.documentsService.findByUserId(userId);
  }

  @Post('user/:userId')
  @RequirePermissions(Permission.STUDENT_CREATE, Permission.STAFF_CREATE)
  async createForUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: Partial<CreateDocumentDto>,
  ) {
    return this.documentsService.createForUser(userId, dto);
  }

  @Patch(':id/status')
  @RequirePermissions(Permission.STUDENT_UPDATE, Permission.STAFF_UPDATE)
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { status: string; rejectionReason?: string },
  ) {
    return this.documentsService.updateStatus(id, body.status, body.rejectionReason);
  }

  @Delete(':id')
  @RequirePermissions(Permission.STUDENT_DELETE, Permission.STAFF_DELETE)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.documentsService.remove(id);
  }
}
