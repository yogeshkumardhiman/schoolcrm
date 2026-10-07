import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateTransportStopsTable1700000000023 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('TransportStops'))) {
      await queryRunner.createTable(
        new Table({
          name: 'TransportStops',
          columns: [
            { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
            { name: 'routeId', type: 'int', isNullable: true },
            { name: 'stopName', type: 'varchar', isNullable: true },
            { name: 'fee', type: 'decimal', precision: 10, scale: 2, default: 0 },
            { name: 'createdAt', type: 'timestamp', default: 'now()' },
            { name: 'updatedAt', type: 'timestamp', default: 'now()' },
          ],
          foreignKeys: [
            new TableForeignKey({
              columnNames: ['routeId'],
              referencedColumnNames: ['id'],
              referencedTableName: 'TransportRoutes',
              onDelete: 'CASCADE',
            }),
          ],
        }),
        true,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('TransportStops')) {
      await queryRunner.dropTable('TransportStops', true);
    }
  }
}
