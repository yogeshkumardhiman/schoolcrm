import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateSubstitutionAssignmentsTable1700000000011 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('SubstitutionAssignments'))) {
      await queryRunner.createTable(
        new Table({
          name: 'SubstitutionAssignments',
          columns: [
            { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
            { name: 'absentStaffId', type: 'int', isNullable: false },
            { name: 'substituteStaffId', type: 'int', isNullable: false },
            { name: 'date', type: 'varchar', isNullable: false },
            { name: 'periodNumber', type: 'int', isNullable: false },
            { name: 'class', type: 'varchar', isNullable: false },
            { name: 'section', type: 'varchar', default: `'A'` },
            { name: 'subject', type: 'varchar', isNullable: false },
            { name: 'status', type: 'varchar', default: `'ASSIGNED'` },
            { name: 'createdAt', type: 'timestamp', default: 'now()' },
            { name: 'updatedAt', type: 'timestamp', default: 'now()' },
          ],
          foreignKeys: [
            new TableForeignKey({
              columnNames: ['absentStaffId'],
              referencedColumnNames: ['id'],
              referencedTableName: 'Staffs',
              onDelete: 'CASCADE',
            }),
            new TableForeignKey({
              columnNames: ['substituteStaffId'],
              referencedColumnNames: ['id'],
              referencedTableName: 'Staffs',
              onDelete: 'CASCADE',
            }),
          ],
        }),
        true,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('SubstitutionAssignments')) {
      await queryRunner.dropTable('SubstitutionAssignments', true);
    }
  }
}
