export async function up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    if (tables.includes('Events')) {
        console.log('⚠️ [Migration] Table "Events" already exists. Skipping creation.');
        return;
    }

    console.log('⚙️ [Migration] Creating "Events" table...');
    await queryInterface.createTable('Events', {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        title: {
            type: Sequelize.STRING,
        },
        date: {
            type: Sequelize.STRING,
        },
        time: {
            type: Sequelize.STRING,
        },
        location: {
            type: Sequelize.STRING,
        },
        participants: {
            type: Sequelize.STRING,
        },
        color: {
            type: Sequelize.STRING,
        },
        icon: {
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
    console.log('✅ [Migration] "Events" table created successfully.');
}

export async function down(queryInterface, Sequelize) {
    console.log('⚙️ [Migration] Dropping "Events" table...');
    await queryInterface.dropTable('Events');
    console.log('✅ [Migration] "Events" table dropped.');
}
