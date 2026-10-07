import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddDocumentsToStaffsTable1700000000035 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasColumn = await queryRunner.hasColumn('Staffs', 'documents');
    if (!hasColumn) {
      await queryRunner.addColumn(
        'Staffs',
        new TableColumn({
          name: 'documents',
          type: 'jsonb',
          isNullable: true,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasColumn = await queryRunner.hasColumn('Staffs', 'documents');
    if (hasColumn) {
      await queryRunner.dropColumn('Staffs', 'documents');
    }
  }
}
