import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateSalaryPaymentsTable1700000000021 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('SalaryPayments'))) {
      await queryRunner.createTable(
        new Table({
          name: 'SalaryPayments',
          columns: [
            { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
            { name: 'staffId', type: 'int', isNullable: false },
            { name: 'month', type: 'varchar', isNullable: false },
            { name: 'amountPaid', type: 'decimal', precision: 10, scale: 2, default: 0 },
            { name: 'paymentMode', type: 'varchar', default: `'BANK_TRANSFER'` },
            { name: 'transactionId', type: 'varchar', isNullable: true },
            { name: 'remark', type: 'varchar', isNullable: true },
            { name: 'paymentDate', type: 'timestamp', default: 'now()' },
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
    if (await queryRunner.hasTable('SalaryPayments')) {
      await queryRunner.dropTable('SalaryPayments', true);
    }
  }
}
