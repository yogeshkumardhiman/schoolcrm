export async function up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    if (tables.includes('SalaryStructures')) {
        console.log('⚠️ [Migration] Table "SalaryStructures" already exists. Skipping creation.');
        return;
    }

    console.log('⚙️ [Migration] Creating "SalaryStructures" table...');
    await queryInterface.createTable('SalaryStructures', {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        staffId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            unique: true,
            references: {
                model: 'Staffs',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        },
        baseSalary: {
            type: Sequelize.DECIMAL(10, 2),
            defaultValue: 0,
        },
        allowances: {
            type: Sequelize.DECIMAL(10, 2),
            defaultValue: 0,
        },
        deductions: {
            type: Sequelize.DECIMAL(10, 2),
            defaultValue: 0,
        },
        netSalary: {
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
    console.log('✅ [Migration] "SalaryStructures" table created successfully.');
}

export async function down(queryInterface, Sequelize) {
    console.log('⚙️ [Migration] Dropping "SalaryStructures" table...');
    await queryInterface.dropTable('SalaryStructures');
    console.log('✅ [Migration] "SalaryStructures" table dropped.');
}
