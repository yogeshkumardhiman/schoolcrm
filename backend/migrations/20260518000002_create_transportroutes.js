export async function up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    if (tables.includes('TransportRoutes')) {
        console.log('⚠️ [Migration] Table "TransportRoutes" already exists. Skipping creation.');
        return;
    }

    console.log('⚙️ [Migration] Creating "TransportRoutes" table...');
    await queryInterface.createTable('TransportRoutes', {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        routeName: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        monthlyFee: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0,
        },
        busNumber: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        description: {
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
    console.log('✅ [Migration] "TransportRoutes" table created successfully.');
}

export async function down(queryInterface, Sequelize) {
    console.log('⚙️ [Migration] Dropping "TransportRoutes" table...');
    await queryInterface.dropTable('TransportRoutes');
    console.log('✅ [Migration] "TransportRoutes" table dropped.');
}
