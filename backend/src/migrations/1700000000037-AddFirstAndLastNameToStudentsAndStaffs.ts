import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddFirstAndLastNameToStudentsAndStaffs1700000000037
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Students Table
    const hasStudentFirstName = await queryRunner.hasColumn('Students', 'firstName');
    if (!hasStudentFirstName) {
      await queryRunner.addColumn(
        'Students',
        new TableColumn({
          name: 'firstName',
          type: 'varchar',
          isNullable: true,
        }),
      );
    }

    const hasStudentLastName = await queryRunner.hasColumn('Students', 'lastName');
    if (!hasStudentLastName) {
      await queryRunner.addColumn(
        'Students',
        new TableColumn({
          name: 'lastName',
          type: 'varchar',
          isNullable: true,
        }),
      );
    }

    // 2. Staffs Table
    const hasStaffFirstName = await queryRunner.hasColumn('Staffs', 'firstName');
    if (!hasStaffFirstName) {
      await queryRunner.addColumn(
        'Staffs',
        new TableColumn({
          name: 'firstName',
          type: 'varchar',
          isNullable: true,
        }),
      );
    }

    const hasStaffLastName = await queryRunner.hasColumn('Staffs', 'lastName');
    if (!hasStaffLastName) {
      await queryRunner.addColumn(
        'Staffs',
        new TableColumn({
          name: 'lastName',
          type: 'varchar',
          isNullable: true,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasStudentFirstName = await queryRunner.hasColumn('Students', 'firstName');
    if (hasStudentFirstName) {
      await queryRunner.dropColumn('Students', 'firstName');
    }

    const hasStudentLastName = await queryRunner.hasColumn('Students', 'lastName');
    if (hasStudentLastName) {
      await queryRunner.dropColumn('Students', 'lastName');
    }

    const hasStaffFirstName = await queryRunner.hasColumn('Staffs', 'firstName');
    if (hasStaffFirstName) {
      await queryRunner.dropColumn('Staffs', 'firstName');
    }

    const hasStaffLastName = await queryRunner.hasColumn('Staffs', 'lastName');
    if (hasStaffLastName) {
      await queryRunner.dropColumn('Staffs', 'lastName');
    }
  }
}
