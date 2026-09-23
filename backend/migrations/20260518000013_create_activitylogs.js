export async function up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    if (tables.includes('ActivityLogs')) {
        console.log('⚠️ [Migration] Table "ActivityLogs" already exists. Skipping creation.');
        return;
    }

    console.log('⚙️ [Migration] Creating "ActivityLogs" table...');
    await queryInterface.createTable('ActivityLogs', {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        userId: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        userName: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        userRole: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        action: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        subject: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        details: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        ipAddress: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        status: {
            type: Sequelize.ENUM('SUCCESS', 'FAILURE'),
            defaultValue: 'SUCCESS',
        },
        createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
        },
    });
    console.log('✅ [Migration] "ActivityLogs" table created successfully.');
}

export async function down(queryInterface, Sequelize) {
    console.log('⚙️ [Migration] Dropping "ActivityLogs" table...');
    await queryInterface.dropTable('ActivityLogs');
    console.log('✅ [Migration] "ActivityLogs" table dropped.');
}
