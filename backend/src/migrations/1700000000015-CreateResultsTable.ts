import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateResultsTable1700000000015 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('Results'))) {
      await queryRunner.createTable(
        new Table({
          name: 'Results',
          columns: [
            { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
            { name: 'studentId', type: 'int', isNullable: false },
            { name: 'examName', type: 'varchar', isNullable: false },
            { name: 'subject', type: 'varchar', isNullable: false },
            { name: 'marksObtained', type: 'decimal', precision: 5, scale: 2, default: 0 },
            { name: 'maxMarks', type: 'decimal', precision: 5, scale: 2, default: 100 },
            { name: 'grade', type: 'varchar', isNullable: true },
            { name: 'remarks', type: 'varchar', isNullable: true },
            { name: 'createdAt', type: 'timestamp', default: 'now()' },
            { name: 'updatedAt', type: 'timestamp', default: 'now()' },
          ],
          foreignKeys: [
            new TableForeignKey({
              columnNames: ['studentId'],
              referencedColumnNames: ['id'],
              referencedTableName: 'Students',
              onDelete: 'CASCADE',
            }),
          ],
        }),
        true,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('Results')) {
      await queryRunner.dropTable('Results', true);
    }
  }
}
