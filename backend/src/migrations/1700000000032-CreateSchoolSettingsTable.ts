import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateSchoolSettingsTable1700000000032 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('SchoolSettings'))) {
      await queryRunner.createTable(
        new Table({
          name: 'SchoolSettings',
          columns: [
            { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
            { name: 'school_name', type: 'varchar', default: `'School Name'` },
            { name: 'app_title', type: 'varchar', default: `'School App'` },
            { name: 'primary_color', type: 'varchar', default: `'#6C63FF'` },
            { name: 'secondary_color', type: 'varchar', default: `'#8B5CF6'` },
            { name: 'logo_url', type: 'varchar', isNullable: true },
            { name: 'active_features', type: 'jsonb', default: `'["fees", "homework", "exams", "notice", "timetable", "calendar", "helpdesk", "profile"]'` },
            { name: 'maintenance_mode', type: 'boolean', default: false },
            { name: 'emergency_alert', type: 'jsonb', default: `'{"active": false, "title": "", "message": ""}'` },
            { name: 'enableOnlinePayments', type: 'boolean', default: false },
            { name: 'razorpayKeyId', type: 'varchar', isNullable: true },
            { name: 'razorpayKeySecret', type: 'varchar', isNullable: true },
            { name: 'favorite_colors', type: 'jsonb', default: `'[]'` },
            { name: 'timings', type: 'jsonb', default: `'{"summer": {"startTime": "07:30", "endTime": "13:30", "label": "Summer Timing", "months": "April – September"}, "winter": {"startTime": "09:00", "endTime": "15:00", "label": "Winter Timing", "months": "October – March"}}'` },
            { name: 'createdAt', type: 'timestamp', default: 'now()' },
            { name: 'updatedAt', type: 'timestamp', default: 'now()' },
          ],
        }),
        true,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('SchoolSettings')) {
      await queryRunner.dropTable('SchoolSettings', true);
    }
  }
}
