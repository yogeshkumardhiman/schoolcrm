import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateStudentsTable1700000000007 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('Students'))) {
      await queryRunner.createTable(
        new Table({
          name: 'Students',
          columns: [
            { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
            { name: 'userId', type: 'int', isNullable: true },
            { name: 'name', type: 'varchar', isNullable: true },
            { name: 'class', type: 'varchar', isNullable: true },
            { name: 'rollNo', type: 'varchar', isNullable: true },
            { name: 'phone', type: 'varchar', isNullable: true },
            { name: 'fatherName', type: 'varchar', isNullable: true },
            { name: 'motherName', type: 'varchar', isNullable: true },
            { name: 'dob', type: 'varchar', isNullable: true },
            { name: 'gender', type: 'varchar', isNullable: true },
            { name: 'address', type: 'text', isNullable: true },
            { name: 'admissionNo', type: 'varchar', isNullable: true },
            { name: 'email', type: 'varchar', isNullable: true },
            { name: 'bloodGroup', type: 'varchar', isNullable: true },
            { name: 'section', type: 'varchar', default: `'A'` },
            { name: 'feesStatus', type: 'varchar', default: `'PENDING'` },
            { name: 'image', type: 'varchar', isNullable: true },
            { name: 'session', type: 'varchar', isNullable: true },
            { name: 'aadharNo', type: 'varchar', isNullable: true },
            { name: 'password', type: 'varchar', isNullable: true },
            { name: 'religion', type: 'varchar', default: `'HINDU'` },
            { name: 'transportOpted', type: 'boolean', default: false },
            { name: 'transportStopId', type: 'int', isNullable: true },
            { name: 'transportRouteId', type: 'int', isNullable: true },
            { name: 'deviceToken', type: 'varchar', isNullable: true },
            { name: 'createdAt', type: 'timestamp', default: 'now()' },
            { name: 'updatedAt', type: 'timestamp', default: 'now()' },
          ],
          foreignKeys: [
            new TableForeignKey({
              columnNames: ['userId'],
              referencedColumnNames: ['id'],
              referencedTableName: 'Users',
              onDelete: 'SET NULL',
            }),
          ],
        }),
        true,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('Students')) {
      await queryRunner.dropTable('Students', true);
    }
  }
}
