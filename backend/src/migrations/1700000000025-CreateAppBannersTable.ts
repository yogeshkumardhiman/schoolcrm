import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateAppBannersTable1700000000025 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('AppBanners'))) {
      await queryRunner.createTable(
        new Table({
          name: 'AppBanners',
          columns: [
            { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
            { name: 'image_url', type: 'varchar', isNullable: true },
            { name: 'title', type: 'varchar', isNullable: true },
            { name: 'description', type: 'text', isNullable: true },
            { name: 'body', type: 'text', isNullable: true },
            { name: 'action_route', type: 'varchar', isNullable: true },
            { name: 'status', type: 'varchar', default: `'ACTIVE'` },
            { name: 'display_order', type: 'int', default: 0 },
            { name: 'createdAt', type: 'timestamp', default: 'now()' },
            { name: 'updatedAt', type: 'timestamp', default: 'now()' },
          ],
        }),
        true,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('AppBanners')) {
      await queryRunner.dropTable('AppBanners', true);
    }
  }
}
