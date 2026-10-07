import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateStaffTimetablesTable1700000000010 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('StaffTimetables'))) {
      await queryRunner.createTable(
        new Table({
          name: 'StaffTimetables',
          columns: [
            { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
            { name: 'staffId', type: 'int', isNullable: false },
            { name: 'day', type: 'varchar', isNullable: false },
            { name: 'periodNumber', type: 'int', isNullable: false },
            { name: 'class', type: 'varchar', isNullable: false },
            { name: 'section', type: 'varchar', default: `'A'` },
            { name: 'subject', type: 'varchar', isNullable: false },
            { name: 'startTime', type: 'varchar', isNullable: true },
            { name: 'endTime', type: 'varchar', isNullable: true },
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
    if (await queryRunner.hasTable('StaffTimetables')) {
      await queryRunner.dropTable('StaffTimetables', true);
    }
  }
}
