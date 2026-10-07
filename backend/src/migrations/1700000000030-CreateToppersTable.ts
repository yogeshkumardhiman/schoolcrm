import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateToppersTable1700000000030 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('Toppers'))) {
      await queryRunner.createTable(
        new Table({
          name: 'Toppers',
          columns: [
            { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
            { name: 'name', type: 'varchar', isNullable: true },
            { name: 'class', type: 'varchar', isNullable: true },
            { name: 'percentage', type: 'varchar', isNullable: true },
            { name: 'session', type: 'varchar', isNullable: true },
            { name: 'rank', type: 'int', isNullable: true },
            { name: 'image', type: 'varchar', isNullable: true },
            { name: 'createdAt', type: 'timestamp', default: 'now()' },
            { name: 'updatedAt', type: 'timestamp', default: 'now()' },
          ],
        }),
        true,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('Toppers')) {
      await queryRunner.dropTable('Toppers', true);
    }
  }
}
