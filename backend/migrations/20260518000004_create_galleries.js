export async function up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    if (tables.includes('Galleries')) {
        console.log('⚠️ [Migration] Table "Galleries" already exists. Skipping creation.');
        return;
    }

    console.log('⚙️ [Migration] Creating "Galleries" table...');
    await queryInterface.createTable('Galleries', {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        title: {
            type: Sequelize.STRING,
        },
        url: {
            type: Sequelize.STRING,
        },
        category: {
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
    console.log('✅ [Migration] "Galleries" table created successfully.');
}

export async function down(queryInterface, Sequelize) {
    console.log('⚙️ [Migration] Dropping "Galleries" table...');
    await queryInterface.dropTable('Galleries');
    console.log('✅ [Migration] "Galleries" table dropped.');
}
