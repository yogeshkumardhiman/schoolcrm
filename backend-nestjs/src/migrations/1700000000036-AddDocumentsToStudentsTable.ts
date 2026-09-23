import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddDocumentsToStudentsTable1700000000036
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasColumn = await queryRunner.hasColumn('Students', 'documents');
    if (!hasColumn) {
      await queryRunner.addColumn(
        'Students',
        new TableColumn({
          name: 'documents',
          type: 'jsonb',
          isNullable: true,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasColumn = await queryRunner.hasColumn('Students', 'documents');
    if (hasColumn) {
      await queryRunner.dropColumn('Students', 'documents');
    }
  }
}
