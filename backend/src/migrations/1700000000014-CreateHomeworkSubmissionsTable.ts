import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateHomeworkSubmissionsTable1700000000014 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('HomeworkSubmissions'))) {
      await queryRunner.createTable(
        new Table({
          name: 'HomeworkSubmissions',
          columns: [
            { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
            { name: 'homeworkId', type: 'int', isNullable: false },
            { name: 'studentId', type: 'int', isNullable: false },
            { name: 'submissionText', type: 'text', isNullable: true },
            { name: 'fileUrl', type: 'varchar', isNullable: true },
            { name: 'status', type: 'varchar', default: `'SUBMITTED'` },
            { name: 'feedback', type: 'text', isNullable: true },
            { name: 'marks', type: 'varchar', isNullable: true },
            { name: 'createdAt', type: 'timestamp', default: 'now()' },
            { name: 'updatedAt', type: 'timestamp', default: 'now()' },
          ],
          foreignKeys: [
            new TableForeignKey({
              columnNames: ['homeworkId'],
              referencedColumnNames: ['id'],
              referencedTableName: 'Homework',
              onDelete: 'CASCADE',
            }),
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
    if (await queryRunner.hasTable('HomeworkSubmissions')) {
      await queryRunner.dropTable('HomeworkSubmissions', true);
    }
  }
}
