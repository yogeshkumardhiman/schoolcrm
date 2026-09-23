export async function up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    if (tables.includes('Grievances')) {
        console.log('⚠️ [Migration] Table "Grievances" already exists. Skipping creation.');
        return;
    }

    console.log('⚙️ [Migration] Creating "Grievances" table...');
    await queryInterface.createTable('Grievances', {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        studentId: {
            type: Sequelize.INTEGER,
        },
        studentName: {
            type: Sequelize.STRING,
        },
        class: {
            type: Sequelize.STRING,
        },
        section: {
            type: Sequelize.STRING,
        },
        subject: {
            type: Sequelize.STRING,
        },
        message: {
            type: Sequelize.TEXT,
        },
        teacherReply: {
            type: Sequelize.TEXT,
        },
        status: {
            type: Sequelize.STRING,
            defaultValue: 'PENDING',
        },
        date: {
            type: Sequelize.STRING,
            defaultValue: '2026-05-18T09:33:41.229Z',
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
    console.log('✅ [Migration] "Grievances" table created successfully.');
}

export async function down(queryInterface, Sequelize) {
    console.log('⚙️ [Migration] Dropping "Grievances" table...');
    await queryInterface.dropTable('Grievances');
    console.log('✅ [Migration] "Grievances" table dropped.');
}
