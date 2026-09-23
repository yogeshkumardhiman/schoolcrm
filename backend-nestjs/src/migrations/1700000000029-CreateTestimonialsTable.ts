import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateTestimonialsTable1700000000029 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('Testimonials'))) {
      await queryRunner.createTable(
        new Table({
          name: 'Testimonials',
          columns: [
            { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
            { name: 'name', type: 'varchar', isNullable: true },
            { name: 'role', type: 'varchar', isNullable: true },
            { name: 'text', type: 'text', isNullable: true },
            { name: 'image', type: 'varchar', isNullable: true },
            { name: 'createdAt', type: 'timestamp', default: 'now()' },
            { name: 'updatedAt', type: 'timestamp', default: 'now()' },
          ],
        }),
        true,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('Testimonials')) {
      await queryRunner.dropTable('Testimonials', true);
    }
  }
}
