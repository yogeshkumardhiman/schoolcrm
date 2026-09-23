import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateFeeHeadsTable1700000000016 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('FeeHeads'))) {
      await queryRunner.createTable(
        new Table({
          name: 'FeeHeads',
          columns: [
            { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
            { name: 'name', type: 'varchar', isNullable: false },
            { name: 'description', type: 'varchar', isNullable: true },
            { name: 'isRecurring', type: 'boolean', default: true },
            { name: 'createdAt', type: 'timestamp', default: 'now()' },
            { name: 'updatedAt', type: 'timestamp', default: 'now()' },
          ],
        }),
        true,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('FeeHeads')) {
      await queryRunner.dropTable('FeeHeads', true);
    }
  }
}
