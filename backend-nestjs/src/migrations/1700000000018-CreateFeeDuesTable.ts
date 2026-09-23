import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateFeeDuesTable1700000000018 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('FeeDues'))) {
      await queryRunner.createTable(
        new Table({
          name: 'FeeDues',
          columns: [
            { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
            { name: 'studentId', type: 'int', isNullable: false },
            { name: 'month', type: 'varchar', isNullable: false },
            { name: 'amountDue', type: 'decimal', precision: 10, scale: 2, default: 0 },
            { name: 'dueDate', type: 'varchar', isNullable: true },
            { name: 'status', type: 'varchar', default: `'PENDING'` },
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
    if (await queryRunner.hasTable('FeeDues')) {
      await queryRunner.dropTable('FeeDues', true);
    }
  }
}
