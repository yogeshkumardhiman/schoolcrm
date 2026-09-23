import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateFeeStructuresTable1700000000017 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('FeeStructures'))) {
      await queryRunner.createTable(
        new Table({
          name: 'FeeStructures',
          columns: [
            { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
            { name: 'class', type: 'varchar', isNullable: false },
            { name: 'tuitionFee', type: 'decimal', precision: 10, scale: 2, default: 0 },
            { name: 'annualFee', type: 'decimal', precision: 10, scale: 2, default: 0 },
            { name: 'admissionFee', type: 'decimal', precision: 10, scale: 2, default: 0 },
            { name: 'examFee', type: 'decimal', precision: 10, scale: 2, default: 0 },
            { name: 'transportFee', type: 'decimal', precision: 10, scale: 2, default: 0 },
            { name: 'createdAt', type: 'timestamp', default: 'now()' },
            { name: 'updatedAt', type: 'timestamp', default: 'now()' },
          ],
        }),
        true,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('FeeStructures')) {
      await queryRunner.dropTable('FeeStructures', true);
    }
  }
}
