export async function up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    if (tables.includes('TransportStops')) {
        console.log('⚠️ [Migration] Table "TransportStops" already exists. Skipping creation.');
        return;
    }

    console.log('⚙️ [Migration] Creating "TransportStops" table...');
    await queryInterface.createTable('TransportStops', {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        routeId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'TransportRoutes',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        },
        stopName: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        fee: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0,
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
    console.log('✅ [Migration] "TransportStops" table created successfully.');
}

export async function down(queryInterface, Sequelize) {
    console.log('⚙️ [Migration] Dropping "TransportStops" table...');
    await queryInterface.dropTable('TransportStops');
    console.log('✅ [Migration] "TransportStops" table dropped.');
}
