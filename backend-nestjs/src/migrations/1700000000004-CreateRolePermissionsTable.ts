import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateRolePermissionsTable1700000000004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('role_permissions'))) {
      await queryRunner.createTable(
        new Table({
          name: 'role_permissions',
          columns: [
            { name: 'role_id', type: 'uuid', isPrimary: true },
            { name: 'permission_id', type: 'int', isPrimary: true },
          ],
          foreignKeys: [
            new TableForeignKey({
              columnNames: ['role_id'],
              referencedColumnNames: ['id'],
              referencedTableName: 'roles',
              onDelete: 'CASCADE',
            }),
            new TableForeignKey({
              columnNames: ['permission_id'],
              referencedColumnNames: ['id'],
              referencedTableName: 'permissions',
              onDelete: 'CASCADE',
            }),
          ],
        }),
        true,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('role_permissions')) {
      await queryRunner.dropTable('role_permissions', true);
    }
  }
}
