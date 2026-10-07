import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateEventsTable1700000000027 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('Events'))) {
      await queryRunner.createTable(
        new Table({
          name: 'Events',
          columns: [
            { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
            { name: 'title', type: 'varchar', isNullable: true },
            { name: 'date', type: 'varchar', isNullable: true },
            { name: 'time', type: 'varchar', isNullable: true },
            { name: 'location', type: 'varchar', isNullable: true },
            { name: 'participants', type: 'varchar', isNullable: true },
            { name: 'color', type: 'varchar', default: `'#4F46E5'` },
            { name: 'icon', type: 'varchar', isNullable: true },
            { name: 'description', type: 'text', isNullable: true },
            { name: 'type', type: 'varchar', default: `'EVENT'` },
            { name: 'endDate', type: 'varchar', isNullable: true },
            { name: 'createdAt', type: 'timestamp', default: 'now()' },
            { name: 'updatedAt', type: 'timestamp', default: 'now()' },
          ],
        }),
        true,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('Events')) {
      await queryRunner.dropTable('Events', true);
    }
  }
}
