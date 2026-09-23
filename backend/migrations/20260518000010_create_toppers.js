export async function up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    if (tables.includes('Toppers')) {
        console.log('⚠️ [Migration] Table "Toppers" already exists. Skipping creation.');
        return;
    }

    console.log('⚙️ [Migration] Creating "Toppers" table...');
    await queryInterface.createTable('Toppers', {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: Sequelize.STRING,
        },
        class: {
            type: Sequelize.STRING,
        },
        percentage: {
            type: Sequelize.STRING,
        },
        session: {
            type: Sequelize.STRING,
        },
        rank: {
            type: Sequelize.INTEGER,
        },
        image: {
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
    console.log('✅ [Migration] "Toppers" table created successfully.');
}

export async function down(queryInterface, Sequelize) {
    console.log('⚙️ [Migration] Dropping "Toppers" table...');
    await queryInterface.dropTable('Toppers');
    console.log('✅ [Migration] "Toppers" table dropped.');
}
