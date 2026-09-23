export async function up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    if (tables.includes('StaffTimetables')) {
        console.log('⚠️ [Migration] Table "StaffTimetables" already exists. Skipping creation.');
        return;
    }

    console.log('⚙️ [Migration] Creating "StaffTimetables" table...');
    await queryInterface.createTable('StaffTimetables', {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        staffId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'Staffs',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        },
        day: {
            type: Sequelize.STRING,
        },
        period: {
            type: Sequelize.STRING,
        },
        class: {
            type: Sequelize.STRING,
        },
        section: {
            type: Sequelize.STRING,
        },
        subject: {
            type: Sequelize.STRING,
        },
        createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
        },
        updatedAt: {
            type: Sequelize.DATE,
            allowNull: false,
        },
    });
    console.log('✅ [Migration] "StaffTimetables" table created successfully.');
}

export async function down(queryInterface, Sequelize) {
    console.log('⚙️ [Migration] Dropping "StaffTimetables" table...');
    await queryInterface.dropTable('StaffTimetables');
    console.log('✅ [Migration] "StaffTimetables" table dropped.');
}
