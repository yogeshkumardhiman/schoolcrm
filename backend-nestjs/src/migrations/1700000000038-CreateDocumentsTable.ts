import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateDocumentsTable1700000000038 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('Documents'))) {
      await queryRunner.createTable(
        new Table({
          name: 'Documents',
          columns: [
            {
              name: 'id',
              type: 'int',
              isPrimary: true,
              isGenerated: true,
              generationStrategy: 'increment',
            },
            {
              name: 'userId',
              type: 'int',
              isNullable: false,
            },
            {
              name: 'name',
              type: 'varchar',
              length: '150',
              isNullable: false,
            },
            {
              name: 'type',
              type: 'varchar',
              length: '100',
              default: "'OTHER'",
              isNullable: false,
            },
            {
              name: 'fileKey',
              type: 'varchar',
              length: '500',
              isNullable: false,
            },
            {
              name: 'fileName',
              type: 'varchar',
              length: '255',
              isNullable: true,
            },
            {
              name: 'mimeType',
              type: 'varchar',
              length: '100',
              isNullable: true,
            },
            {
              name: 'fileSize',
              type: 'int',
              isNullable: true,
            },
            {
              name: 'status',
              type: 'varchar',
              length: '50',
              default: "'VERIFIED'",
              isNullable: false,
            },
            {
              name: 'rejectionReason',
              type: 'varchar',
              length: '255',
              isNullable: true,
            },
            {
              name: 'createdAt',
              type: 'timestamp',
              default: 'CURRENT_TIMESTAMP',
            },
            {
              name: 'updatedAt',
              type: 'timestamp',
              default: 'CURRENT_TIMESTAMP',
            },
          ],
        }),
      );

      await queryRunner.createForeignKey(
        'Documents',
        new TableForeignKey({
          columnNames: ['userId'],
          referencedTableName: 'Users',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
        }),
      );

      await queryRunner.createIndex(
        'Documents',
        new TableIndex({
          name: 'IDX_DOCUMENTS_USER_ID',
          columnNames: ['userId'],
        }),
      );

      await queryRunner.createIndex(
        'Documents',
        new TableIndex({
          name: 'IDX_DOCUMENTS_TYPE',
          columnNames: ['type'],
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('Documents')) {
      await queryRunner.dropTable('Documents');
    }
  }
}
