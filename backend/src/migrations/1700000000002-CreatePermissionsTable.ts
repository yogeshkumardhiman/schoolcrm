import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreatePermissionsTable1700000000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('permissions'))) {
      await queryRunner.createTable(
        new Table({
          name: 'permissions',
          columns: [
            { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
            { name: 'code', type: 'varchar', isUnique: true, isNullable: false },
            { name: 'name', type: 'varchar', isNullable: false },
            { name: 'module', type: 'varchar', isNullable: false },
            { name: 'description', type: 'varchar', isNullable: true },
            { name: 'createdAt', type: 'timestamp', default: 'now()' },
            { name: 'updatedAt', type: 'timestamp', default: 'now()' },
          ],
        }),
        true,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('permissions')) {
      await queryRunner.dropTable('permissions', true);
    }
  }
}
