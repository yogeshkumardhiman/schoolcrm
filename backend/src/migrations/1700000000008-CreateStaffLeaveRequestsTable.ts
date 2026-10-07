import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateStaffLeaveRequestsTable1700000000008 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('StaffLeaveRequests'))) {
      await queryRunner.createTable(
        new Table({
          name: 'StaffLeaveRequests',
          columns: [
            { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
            { name: 'staffId', type: 'int', isNullable: false },
            { name: 'leaveType', type: 'varchar', isNullable: false },
            { name: 'startDate', type: 'varchar', isNullable: false },
            { name: 'endDate', type: 'varchar', isNullable: false },
            { name: 'reason', type: 'text', isNullable: true },
            { name: 'status', type: 'varchar', default: `'PENDING'` },
            { name: 'approvedBy', type: 'varchar', isNullable: true },
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
    if (await queryRunner.hasTable('StaffLeaveRequests')) {
      await queryRunner.dropTable('StaffLeaveRequests', true);
    }
  }
}
