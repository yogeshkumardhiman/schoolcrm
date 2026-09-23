export async function up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    if (tables.includes('Results')) {
        console.log('⚠️ [Migration] Table "Results" already exists. Skipping creation.');
        return;
    }

    console.log('⚙️ [Migration] Creating "Results" table...');
    await queryInterface.createTable('Results', {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        studentId: {
            type: Sequelize.INTEGER,
        },
        subject: {
            type: Sequelize.STRING,
        },
        marks: {
            type: Sequelize.INTEGER,
        },
        total: {
            type: Sequelize.INTEGER,
        },
        examType: {
            type: Sequelize.STRING,
        },
        session: {
            type: Sequelize.STRING,
        },
        class: {
            type: Sequelize.STRING,
        },
        section: {
            type: Sequelize.STRING,
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
    console.log('✅ [Migration] "Results" table created successfully.');
}

export async function down(queryInterface, Sequelize) {
    console.log('⚙️ [Migration] Dropping "Results" table...');
    await queryInterface.dropTable('Results');
    console.log('✅ [Migration] "Results" table dropped.');
}
