export async function up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    if (tables.includes('FeePayments')) {
        console.log('⚠️ [Migration] Table "FeePayments" already exists. Skipping creation.');
        return;
    }

    console.log('⚙️ [Migration] Creating "FeePayments" table...');
    await queryInterface.createTable('FeePayments', {
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
        amountPaid: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: false,
        },
        paymentDate: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        mode: {
            type: Sequelize.ENUM('CASH', 'ONLINE', 'CHEQUE'),
            defaultValue: 'CASH',
        },
        month: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        transactionId: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        remark: {
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
    console.log('✅ [Migration] "FeePayments" table created successfully.');
}

export async function down(queryInterface, Sequelize) {
    console.log('⚙️ [Migration] Dropping "FeePayments" table...');
    await queryInterface.dropTable('FeePayments');
    console.log('✅ [Migration] "FeePayments" table dropped.');
}
