export async function up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    if (tables.includes('StudentFeeAssignments')) {
        console.log('⚠️ [Migration] Table "StudentFeeAssignments" already exists. Skipping creation.');
        return;
    }

    console.log('⚙️ [Migration] Creating "StudentFeeAssignments" table...');
    await queryInterface.createTable('StudentFeeAssignments', {
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
            allowNull: false,
            defaultValue: 0,
        },
        frequency: {
            type: Sequelize.STRING,
            allowNull: false,
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
    console.log('✅ [Migration] "StudentFeeAssignments" table created successfully.');
}

export async function down(queryInterface, Sequelize) {
    console.log('⚙️ [Migration] Dropping "StudentFeeAssignments" table...');
    await queryInterface.dropTable('StudentFeeAssignments');
    console.log('✅ [Migration] "StudentFeeAssignments" table dropped.');
}
