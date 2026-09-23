import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class ChangeIdentifierToLoginId1700000000034
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Update Users Table: Rename 'identifier' to 'loginId'
    if (await queryRunner.hasTable('Users')) {
      const usersTable = await queryRunner.getTable('Users');
      const hasIdentifier = usersTable?.columns.some(
        (c) => c.name === 'identifier',
      );
      const hasLoginId = usersTable?.columns.some((c) => c.name === 'loginId');

      if (hasIdentifier && !hasLoginId) {
        await queryRunner.renameColumn('Users', 'identifier', 'loginId');
      } else if (!hasLoginId) {
        await queryRunner.addColumn(
          'Users',
          new TableColumn({
            name: 'loginId',
            type: 'varchar',
            isUnique: true,
            isNullable: false,
            default: `'TEMP_' || floor(random() * 1000000)::text`,
          }),
        );
      }
    }

    // 2. Update Staffs Table: Add/Rename 'loginId'
    if (await queryRunner.hasTable('Staffs')) {
      const staffsTable = await queryRunner.getTable('Staffs');
      const hasIdentifier = staffsTable?.columns.some(
        (c) => c.name === 'identifier',
      );
      const hasLoginId = staffsTable?.columns.some((c) => c.name === 'loginId');

      if (hasIdentifier && !hasLoginId) {
        await queryRunner.renameColumn('Staffs', 'identifier', 'loginId');
      } else if (!hasLoginId) {
        await queryRunner.addColumn(
          'Staffs',
          new TableColumn({
            name: 'loginId',
            type: 'varchar',
            isUnique: true,
            isNullable: true,
          }),
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('Staffs')) {
      const staffsTable = await queryRunner.getTable('Staffs');
      const hasLoginId = staffsTable?.columns.some((c) => c.name === 'loginId');
      if (hasLoginId) {
        await queryRunner.dropColumn('Staffs', 'loginId');
      }
    }

    if (await queryRunner.hasTable('Users')) {
      const usersTable = await queryRunner.getTable('Users');
      const hasLoginId = usersTable?.columns.some((c) => c.name === 'loginId');
      const hasIdentifier = usersTable?.columns.some(
        (c) => c.name === 'identifier',
      );
      if (hasLoginId && !hasIdentifier) {
        await queryRunner.renameColumn('Users', 'loginId', 'identifier');
      }
    }
  }
}
