export async function up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    if (tables.includes('FeeDues')) {
        console.log('⚠️ [Migration] Table "FeeDues" already exists. Skipping creation.');
        return;
    }

    console.log('⚙️ [Migration] Creating "FeeDues" table...');
    await queryInterface.createTable('FeeDues', {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        studentId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'Students',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        },
        month: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        year: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        totalAmount: {
            type: Sequelize.DECIMAL(10, 2),
            defaultValue: 0,
        },
        breakdown: {
            type: Sequelize.JSON,
            defaultValue: {},
        },
        paidAmount: {
            type: Sequelize.DECIMAL(10, 2),
            defaultValue: 0,
        },
        status: {
            type: Sequelize.ENUM('PENDING', 'PARTIAL', 'PAID'),
            defaultValue: 'PENDING',
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
    console.log('✅ [Migration] "FeeDues" table created successfully.');
}

export async function down(queryInterface, Sequelize) {
    console.log('⚙️ [Migration] Dropping "FeeDues" table...');
    await queryInterface.dropTable('FeeDues');
    console.log('✅ [Migration] "FeeDues" table dropped.');
}
