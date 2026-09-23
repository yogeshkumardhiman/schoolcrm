export async function up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    if (tables.includes('ClassFeeStructures')) {
        console.log('⚠️ [Migration] Table "ClassFeeStructures" already exists. Skipping creation.');
        return;
    }

    console.log('⚙️ [Migration] Creating "ClassFeeStructures" table...');
    await queryInterface.createTable('ClassFeeStructures', {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        class: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        feeHeadId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'FeeHeads',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        },
        amount: {
            type: Sequelize.DECIMAL(10, 2),
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
    console.log('✅ [Migration] "ClassFeeStructures" table created successfully.');
}

export async function down(queryInterface, Sequelize) {
    console.log('⚙️ [Migration] Dropping "ClassFeeStructures" table...');
    await queryInterface.dropTable('ClassFeeStructures');
    console.log('✅ [Migration] "ClassFeeStructures" table dropped.');
}
