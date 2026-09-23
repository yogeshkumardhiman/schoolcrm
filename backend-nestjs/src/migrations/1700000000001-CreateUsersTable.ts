import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUsersTable1700000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'users_usertype_enum') THEN
          CREATE TYPE "users_usertype_enum" AS ENUM('STAFF', 'STUDENT', 'ADMIN', 'PARENT');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Users_usertype_enum') THEN
          CREATE TYPE "Users_usertype_enum" AS ENUM('STAFF', 'STUDENT', 'ADMIN', 'PARENT');
        END IF;
      END $$;`,
    );

    if (!(await queryRunner.hasTable('Users'))) {
      await queryRunner.createTable(
        new Table({
          name: 'Users',
          columns: [
            {
              name: 'id',
              type: 'int',
              isPrimary: true,
              isGenerated: true,
              generationStrategy: 'increment',
            },
            {
              name: 'identifier',
              type: 'varchar',
              isUnique: true,
              isNullable: false,
            },
            {
              name: 'email',
              type: 'varchar',
              isNullable: true,
            },
            {
              name: 'password',
              type: 'varchar',
              isNullable: false,
            },
            {
              name: 'userType',
              type: 'Users_usertype_enum',
              isNullable: false,
            },
            {
              name: 'roleId',
              type: 'uuid',
              isNullable: true,
            },
            {
              name: 'isActive',
              type: 'boolean',
              default: true,
            },
            {
              name: 'permissions',
              type: 'jsonb',
              isNullable: true,
              default: `'[]'`,
            },
            {
              name: 'deviceToken',
              type: 'varchar',
              isNullable: true,
            },
            {
              name: 'createdAt',
              type: 'timestamp',
              default: 'now()',
            },
            {
              name: 'updatedAt',
              type: 'timestamp',
              default: 'now()',
            },
          ],
        }),
        true,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('Users')) {
      await queryRunner.dropTable('Users', true);
    }
    await queryRunner.query(`DROP TYPE IF EXISTS "Users_usertype_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "users_usertype_enum"`);
  }
}
