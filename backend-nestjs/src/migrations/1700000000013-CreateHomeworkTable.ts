import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateHomeworkTable1700000000013 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('Homework'))) {
      await queryRunner.createTable(
        new Table({
          name: 'Homework',
          columns: [
            { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
            { name: 'class', type: 'varchar', isNullable: false },
            { name: 'section', type: 'varchar', default: `'A'` },
            { name: 'subject', type: 'varchar', isNullable: false },
            { name: 'title', type: 'varchar', isNullable: false },
            { name: 'description', type: 'text', isNullable: true },
            { name: 'dueDate', type: 'varchar', isNullable: false },
            { name: 'attachmentUrl', type: 'varchar', isNullable: true },
            { name: 'teacherId', type: 'int', isNullable: true },
            { name: 'createdAt', type: 'timestamp', default: 'now()' },
            { name: 'updatedAt', type: 'timestamp', default: 'now()' },
          ],
          foreignKeys: [
            new TableForeignKey({
              columnNames: ['teacherId'],
              referencedColumnNames: ['id'],
              referencedTableName: 'Staffs',
              onDelete: 'SET NULL',
            }),
          ],
        }),
        true,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('Homework')) {
      await queryRunner.dropTable('Homework', true);
    }
  }
}
