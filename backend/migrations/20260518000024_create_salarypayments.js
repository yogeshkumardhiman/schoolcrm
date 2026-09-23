export async function up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    if (tables.includes('SalaryPayments')) {
        console.log('⚠️ [Migration] Table "SalaryPayments" already exists. Skipping creation.');
        return;
    }

    console.log('⚙️ [Migration] Creating "SalaryPayments" table...');
    await queryInterface.createTable('SalaryPayments', {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        staffId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'Staffs',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        },
        amount: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: false,
        },
        month: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        year: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        status: {
            type: Sequelize.ENUM('PAID', 'PENDING'),
            defaultValue: 'PENDING',
        },
        paymentDate: {
            type: Sequelize.DATE,
            allowNull: true,
        },
        transactionId: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        remark: {
            type: Sequelize.TEXT,
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
    console.log('✅ [Migration] "SalaryPayments" table created successfully.');
}

export async function down(queryInterface, Sequelize) {
    console.log('⚙️ [Migration] Dropping "SalaryPayments" table...');
    await queryInterface.dropTable('SalaryPayments');
    console.log('✅ [Migration] "SalaryPayments" table dropped.');
}
