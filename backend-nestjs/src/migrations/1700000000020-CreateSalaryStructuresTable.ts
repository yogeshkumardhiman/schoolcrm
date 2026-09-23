import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateSalaryStructuresTable1700000000020 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('SalaryStructures'))) {
      await queryRunner.createTable(
        new Table({
          name: 'SalaryStructures',
          columns: [
            { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
            { name: 'staffId', type: 'int', isNullable: false },
            { name: 'basicPay', type: 'decimal', precision: 10, scale: 2, default: 0 },
            { name: 'allowance', type: 'decimal', precision: 10, scale: 2, default: 0 },
            { name: 'deductions', type: 'decimal', precision: 10, scale: 2, default: 0 },
            { name: 'netSalary', type: 'decimal', precision: 10, scale: 2, default: 0 },
            { name: 'createdAt', type: 'timestamp', default: 'now()' },
            { name: 'updatedAt', type: 'timestamp', default: 'now()' },
          ],
          foreignKeys: [
            new TableForeignKey({
              columnNames: ['staffId'],
              referencedColumnNames: ['id'],
              referencedTableName: 'Staffs',
              onDelete: 'CASCADE',
            }),
          ],
        }),
        true,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('SalaryStructures')) {
      await queryRunner.dropTable('SalaryStructures', true);
    }
  }
}
