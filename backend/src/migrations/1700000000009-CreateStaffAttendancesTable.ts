import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateStaffAttendancesTable1700000000009 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('StaffAttendances'))) {
      await queryRunner.createTable(
        new Table({
          name: 'StaffAttendances',
          columns: [
            { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
            { name: 'staffId', type: 'int', isNullable: false },
            { name: 'date', type: 'varchar', isNullable: false },
            { name: 'status', type: 'varchar', default: `'PRESENT'` },
            { name: 'checkIn', type: 'varchar', isNullable: true },
            { name: 'checkOut', type: 'varchar', isNullable: true },
            { name: 'remarks', type: 'varchar', isNullable: true },
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
    if (await queryRunner.hasTable('StaffAttendances')) {
      await queryRunner.dropTable('StaffAttendances', true);
    }
  }
}
