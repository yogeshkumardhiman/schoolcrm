export async function up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    if (tables.includes('Roles')) {
        console.log('⚠️ [Migration] Table "Roles" already exists. Skipping creation.');
        return;
    }

    console.log('⚙️ [Migration] Creating "Roles" table...');
    await queryInterface.createTable('Roles', {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
        },
        description: {
            type: Sequelize.STRING,
        },
        rules: {
            type: Sequelize.JSONB,
            defaultValue: [],
        },
        isActive: {
            type: Sequelize.BOOLEAN,
            defaultValue: true,
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
    console.log('✅ [Migration] "Roles" table created successfully.');
}

export async function down(queryInterface, Sequelize) {
    console.log('⚙️ [Migration] Dropping "Roles" table...');
    await queryInterface.dropTable('Roles');
    console.log('✅ [Migration] "Roles" table dropped.');
}
