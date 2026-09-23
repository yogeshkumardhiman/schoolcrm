export async function up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    if (tables.includes('Notices')) {
        console.log('⚠️ [Migration] Table "Notices" already exists. Skipping creation.');
        return;
    }

    console.log('⚙️ [Migration] Creating "Notices" table...');
    await queryInterface.createTable('Notices', {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        title: {
            type: Sequelize.STRING,
        },
        content: {
            type: Sequelize.TEXT,
        },
        tag: {
            type: Sequelize.STRING,
        },
        color: {
            type: Sequelize.STRING,
        },
        date: {
            type: Sequelize.STRING,
        },
        session: {
            type: Sequelize.STRING,
        },
        class: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        section: {
            type: Sequelize.STRING,
            allowNull: true,
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
    console.log('✅ [Migration] "Notices" table created successfully.');
}

export async function down(queryInterface, Sequelize) {
    console.log('⚙️ [Migration] Dropping "Notices" table...');
    await queryInterface.dropTable('Notices');
    console.log('✅ [Migration] "Notices" table dropped.');
}
