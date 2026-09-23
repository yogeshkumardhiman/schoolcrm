export async function up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    if (tables.includes('ComplianceDocs')) {
        console.log('⚠️ [Migration] Table "ComplianceDocs" already exists. Skipping creation.');
        return;
    }

    console.log('⚙️ [Migration] Creating "ComplianceDocs" table...');
    await queryInterface.createTable('ComplianceDocs', {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        title: {
            type: Sequelize.STRING,
        },
        category: {
            type: Sequelize.STRING,
        },
        url: {
            type: Sequelize.STRING,
        },
        uploadDate: {
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
    console.log('✅ [Migration] "ComplianceDocs" table created successfully.');
}

export async function down(queryInterface, Sequelize) {
    console.log('⚙️ [Migration] Dropping "ComplianceDocs" table...');
    await queryInterface.dropTable('ComplianceDocs');
    console.log('✅ [Migration] "ComplianceDocs" table dropped.');
}
