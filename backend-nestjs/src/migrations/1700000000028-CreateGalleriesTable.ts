import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateGalleriesTable1700000000028 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('Galleries'))) {
      await queryRunner.createTable(
        new Table({
          name: 'Galleries',
          columns: [
            { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
            { name: 'title', type: 'varchar', isNullable: true },
            { name: 'url', type: 'varchar', isNullable: true },
            { name: 'category', type: 'varchar', isNullable: true },
            { name: 'createdAt', type: 'timestamp', default: 'now()' },
            { name: 'updatedAt', type: 'timestamp', default: 'now()' },
          ],
        }),
        true,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('Galleries')) {
      await queryRunner.dropTable('Galleries', true);
    }
  }
}
