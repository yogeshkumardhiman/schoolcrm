import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateSchoolInfosTable1700000000031 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('SchoolInfos'))) {
      await queryRunner.createTable(
        new Table({
          name: 'SchoolInfos',
          columns: [
            { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
            { name: 'aboutTitle', type: 'varchar', isNullable: true },
            { name: 'aboutDescription', type: 'text', isNullable: true },
            { name: 'mission', type: 'text', isNullable: true },
            { name: 'vision', type: 'text', isNullable: true },
            { name: 'principalMessage', type: 'text', isNullable: true },
            { name: 'contactEmail', type: 'varchar', isNullable: true },
            { name: 'contactPhone', type: 'varchar', isNullable: true },
            { name: 'address', type: 'text', isNullable: true },
            { name: 'maxClass', type: 'varchar', default: `'12TH'` },
            { name: 'schoolName', type: 'varchar', isNullable: true },
            { name: 'logoImage', type: 'varchar', isNullable: true },
            { name: 'domainPrefix', type: 'varchar', isNullable: true },
            { name: 'primaryColor', type: 'varchar', isNullable: true },
            { name: 'secondaryColor', type: 'varchar', isNullable: true },
            { name: 'bannerTitle', type: 'varchar', isNullable: true },
            { name: 'bannerImage', type: 'varchar', isNullable: true },
            { name: 'principalName', type: 'varchar', isNullable: true },
            { name: 'principalImage', type: 'varchar', isNullable: true },
            { name: 'phone', type: 'varchar', isNullable: true },
            { name: 'email', type: 'varchar', isNullable: true },
            { name: 'active_features', type: 'jsonb', isNullable: true },
            { name: 'top_info_bar', type: 'jsonb', isNullable: true },
            { name: 'theme_config', type: 'jsonb', isNullable: true },
            { name: 'homepage_layout', type: 'jsonb', isNullable: true },
            { name: 'statistics', type: 'jsonb', isNullable: true },
            { name: 'why_choose_us', type: 'jsonb', isNullable: true },
            { name: 'director_message', type: 'jsonb', isNullable: true },
            { name: 'academics_config', type: 'jsonb', isNullable: true },
            { name: 'campus_tour', type: 'jsonb', isNullable: true },
            { name: 'admission_timeline', type: 'jsonb', isNullable: true },
            { name: 'facilities_config', type: 'jsonb', isNullable: true },
            { name: 'faqs_config', type: 'jsonb', isNullable: true },
            { name: 'cta_config', type: 'jsonb', isNullable: true },
            { name: 'footer_config', type: 'jsonb', isNullable: true },
            { name: 'floating_buttons', type: 'jsonb', isNullable: true },
            { name: 'navbar_config', type: 'jsonb', isNullable: true },
            { name: 'createdAt', type: 'timestamp', default: 'now()' },
            { name: 'updatedAt', type: 'timestamp', default: 'now()' },
          ],
        }),
        true,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('SchoolInfos')) {
      await queryRunner.dropTable('SchoolInfos', true);
    }
  }
}
