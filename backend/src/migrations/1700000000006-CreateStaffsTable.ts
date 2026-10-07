import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateStaffsTable1700000000006 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('Staffs'))) {
      await queryRunner.createTable(
        new Table({
          name: 'Staffs',
          columns: [
            { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
            { name: 'userId', type: 'int', isNullable: true },
            { name: 'name', type: 'varchar', isNullable: true },
            { name: 'role', type: 'varchar', isNullable: true },
            { name: 'designation', type: 'varchar', isNullable: true },
            { name: 'subject', type: 'varchar', isNullable: true },
            { name: 'image', type: 'varchar', isNullable: true },
            { name: 'phone', type: 'varchar', isNullable: true },
            { name: 'email', type: 'varchar', isUnique: true, isNullable: true },
            { name: 'qualification', type: 'varchar', isNullable: true },
            { name: 'experience', type: 'varchar', isNullable: true },
            { name: 'joiningDate', type: 'varchar', isNullable: true },
            { name: 'class', type: 'varchar', isNullable: true },
            { name: 'section', type: 'varchar', default: `'A'` },
            { name: 'password', type: 'varchar', default: `'teacher123'` },
            { name: 'about', type: 'text', isNullable: true },
            { name: 'address', type: 'text', isNullable: true },
            { name: 'gender', type: 'varchar', isNullable: true },
            { name: 'dob', type: 'varchar', isNullable: true },
            { name: 'permissions', type: 'jsonb', isNullable: true, default: `'[]'` },
            { name: 'can_manage_app_settings', type: 'boolean', default: false },
            { name: 'roleId', type: 'uuid', isNullable: true },
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
            new TableForeignKey({
              columnNames: ['roleId'],
              referencedColumnNames: ['id'],
              referencedTableName: 'roles',
              onDelete: 'SET NULL',
            }),
          ],
        }),
        true,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('Staffs')) {
      await queryRunner.dropTable('Staffs', true);
    }
  }
}
