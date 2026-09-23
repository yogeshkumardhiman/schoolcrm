import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateAttendancesTable1700000000012 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('Attendances'))) {
      await queryRunner.createTable(
        new Table({
          name: 'Attendances',
          columns: [
            { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
            { name: 'studentId', type: 'int', isNullable: false },
            { name: 'date', type: 'varchar', isNullable: false },
            { name: 'status', type: 'varchar', default: `'PRESENT'` },
            { name: 'remarks', type: 'varchar', isNullable: true },
            { name: 'markedBy', type: 'varchar', isNullable: true },
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
    if (await queryRunner.hasTable('Attendances')) {
      await queryRunner.dropTable('Attendances', true);
    }
  }
}
