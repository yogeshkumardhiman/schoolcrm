export async function up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    if (tables.includes('StaffAttendances')) {
        console.log('⚠️ [Migration] Table "StaffAttendances" already exists. Skipping creation.');
        return;
    }

    console.log('⚙️ [Migration] Creating "StaffAttendances" table...');
    await queryInterface.createTable('StaffAttendances', {
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
        date: {
            type: Sequelize.STRING,
        },
        status: {
            type: Sequelize.STRING,
        },
        markedBy: {
            type: Sequelize.STRING,
        },
        remark: {
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
    console.log('✅ [Migration] "StaffAttendances" table created successfully.');
}

export async function down(queryInterface, Sequelize) {
    console.log('⚙️ [Migration] Dropping "StaffAttendances" table...');
    await queryInterface.dropTable('StaffAttendances');
    console.log('✅ [Migration] "StaffAttendances" table dropped.');
}
