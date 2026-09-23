export async function up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    if (tables.includes('StaffLeaveRequests')) {
        console.log('⚠️ [Migration] Table "StaffLeaveRequests" already exists. Skipping creation.');
        return;
    }

    console.log('⚙️ [Migration] Creating "StaffLeaveRequests" table...');
    await queryInterface.createTable('StaffLeaveRequests', {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        staffId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'Staffs',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        },
        startDate: {
            type: Sequelize.STRING,
        },
        endDate: {
            type: Sequelize.STRING,
        },
        reason: {
            type: Sequelize.TEXT,
        },
        type: {
            type: Sequelize.STRING,
            defaultValue: 'FULL_DAY',
        },
        status: {
            type: Sequelize.STRING,
            defaultValue: 'PENDING',
        },
        appliedAt: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
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
    console.log('✅ [Migration] "StaffLeaveRequests" table created successfully.');
}

export async function down(queryInterface, Sequelize) {
    console.log('⚙️ [Migration] Dropping "StaffLeaveRequests" table...');
    await queryInterface.dropTable('StaffLeaveRequests');
    console.log('✅ [Migration] "StaffLeaveRequests" table dropped.');
}
