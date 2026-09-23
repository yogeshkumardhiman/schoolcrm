import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateActivityLogsTable1700000000005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('ActivityLogs'))) {
      await queryRunner.createTable(
        new Table({
          name: 'ActivityLogs',
          columns: [
            { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
            { name: 'action', type: 'varchar', isNullable: false },
            { name: 'performedBy', type: 'varchar', isNullable: false },
            { name: 'role', type: 'varchar', isNullable: true },
            { name: 'details', type: 'text', isNullable: true },
            { name: 'createdAt', type: 'timestamp', default: 'now()' },
          ],
        }),
        true,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('ActivityLogs')) {
      await queryRunner.dropTable('ActivityLogs', true);
    }
  }
}
