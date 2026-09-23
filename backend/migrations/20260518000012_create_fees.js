export async function up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    if (tables.includes('Fees')) {
        console.log('⚠️ [Migration] Table "Fees" already exists. Skipping creation.');
        return;
    }

    console.log('⚙️ [Migration] Creating "Fees" table...');
    await queryInterface.createTable('Fees', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
        },
        type: {
            type: Sequelize.ENUM('PERCENTAGE', 'FLAT'),
            allowNull: false,
            defaultValue: 'FLAT',
        },
        value: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0,
        },
        description: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        status: {
            type: Sequelize.ENUM('ACTIVE', 'INACTIVE'),
            allowNull: false,
            defaultValue: 'ACTIVE',
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
    console.log('✅ [Migration] "Fees" table created successfully.');
}

export async function down(queryInterface, Sequelize) {
    console.log('⚙️ [Migration] Dropping "Fees" table...');
    await queryInterface.dropTable('Fees');
    console.log('✅ [Migration] "Fees" table dropped.');
}
