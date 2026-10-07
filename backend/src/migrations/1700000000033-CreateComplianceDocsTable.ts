import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateComplianceDocsTable1700000000033 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('ComplianceDocs'))) {
      await queryRunner.createTable(
        new Table({
          name: 'ComplianceDocs',
          columns: [
            { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
            { name: 'title', type: 'varchar', isNullable: false },
            { name: 'category', type: 'varchar', isNullable: true },
            { name: 'url', type: 'varchar', isNullable: false },
            { name: 'uploadDate', type: 'timestamp', default: 'now()' },
            { name: 'createdAt', type: 'timestamp', default: 'now()' },
            { name: 'updatedAt', type: 'timestamp', default: 'now()' },
          ],
        }),
        true,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('ComplianceDocs')) {
      await queryRunner.dropTable('ComplianceDocs', true);
    }
  }
}
