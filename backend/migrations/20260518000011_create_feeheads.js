export async function up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    if (tables.includes('FeeHeads')) {
        console.log('⚠️ [Migration] Table "FeeHeads" already exists. Skipping creation.');
        return;
    }

    console.log('⚙️ [Migration] Creating "FeeHeads" table...');
    await queryInterface.createTable('FeeHeads', {
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
        frequency: {
            type: Sequelize.ENUM('MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'YEARLY', 'ONE_TIME'),
            allowNull: false,
        },
        collectOnAdmission: {
            type: Sequelize.BOOLEAN,
            defaultValue: true,
        },
        isOptional: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
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
    console.log('✅ [Migration] "FeeHeads" table created successfully.');
}

export async function down(queryInterface, Sequelize) {
    console.log('⚙️ [Migration] Dropping "FeeHeads" table...');
    await queryInterface.dropTable('FeeHeads');
    console.log('✅ [Migration] "FeeHeads" table dropped.');
}
