import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateNoticesTable1700000000026 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('Notices'))) {
      await queryRunner.createTable(
        new Table({
          name: 'Notices',
          columns: [
            { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
            { name: 'title', type: 'varchar', isNullable: true },
            { name: 'content', type: 'text', isNullable: true },
            { name: 'tag', type: 'varchar', isNullable: true },
            { name: 'color', type: 'varchar', isNullable: true },
            { name: 'date', type: 'varchar', isNullable: true },
            { name: 'session', type: 'varchar', isNullable: true },
            { name: 'class', type: 'varchar', isNullable: true },
            { name: 'section', type: 'varchar', isNullable: true },
            { name: 'studentId', type: 'int', isNullable: true },
            { name: 'targetRole', type: 'varchar', isNullable: true },
            { name: 'createdByRole', type: 'varchar', isNullable: true },
            { name: 'createdById', type: 'int', isNullable: true },
            { name: 'isRead', type: 'boolean', default: false },
            { name: 'createdAt', type: 'timestamp', default: 'now()' },
            { name: 'updatedAt', type: 'timestamp', default: 'now()' },
          ],
        }),
        true,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('Notices')) {
      await queryRunner.dropTable('Notices', true);
    }
  }
}
