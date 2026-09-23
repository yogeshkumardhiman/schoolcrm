import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateTransportRoutesTable1700000000022 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('TransportRoutes'))) {
      await queryRunner.createTable(
        new Table({
          name: 'TransportRoutes',
          columns: [
            { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
            { name: 'routeName', type: 'varchar', isNullable: true },
            { name: 'name', type: 'varchar', isNullable: true },
            { name: 'monthlyFee', type: 'decimal', precision: 10, scale: 2, default: 0 },
            { name: 'busNumber', type: 'varchar', isNullable: true },
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
    if (await queryRunner.hasTable('TransportRoutes')) {
      await queryRunner.dropTable('TransportRoutes', true);
    }
  }
}
