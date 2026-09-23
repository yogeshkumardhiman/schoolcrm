import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateFeePaymentsTable1700000000019 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('FeePayments'))) {
      await queryRunner.createTable(
        new Table({
          name: 'FeePayments',
          columns: [
            { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
            { name: 'studentId', type: 'int', isNullable: false },
            { name: 'amountPaid', type: 'decimal', precision: 10, scale: 2, default: 0 },
            { name: 'month', type: 'varchar', isNullable: true },
            { name: 'paymentMode', type: 'varchar', default: `'CASH'` },
            { name: 'transactionId', type: 'varchar', isNullable: true },
            { name: 'remark', type: 'varchar', isNullable: true },
            { name: 'paymentDate', type: 'timestamp', default: 'now()' },
            { name: 'createdAt', type: 'timestamp', default: 'now()' },
            { name: 'updatedAt', type: 'timestamp', default: 'now()' },
          ],
          foreignKeys: [
            new TableForeignKey({
              columnNames: ['studentId'],
              referencedColumnNames: ['id'],
              referencedTableName: 'Students',
              onDelete: 'CASCADE',
            }),
          ],
        }),
        true,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('FeePayments')) {
      await queryRunner.dropTable('FeePayments', true);
    }
  }
}
