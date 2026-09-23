export async function up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    if (tables.includes('SchoolInfos')) {
        console.log('⚠️ [Migration] Table "SchoolInfos" already exists. Skipping creation.');
        return;
    }

    console.log('⚙️ [Migration] Creating "SchoolInfos" table...');
    await queryInterface.createTable('SchoolInfos', {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        aboutTitle: {
            type: Sequelize.STRING,
        },
        mission: {
            type: Sequelize.TEXT,
        },
        vision: {
            type: Sequelize.TEXT,
        },
        principalMessage: {
            type: Sequelize.TEXT,
        },
        contactEmail: {
            type: Sequelize.STRING,
        },
        contactPhone: {
            type: Sequelize.STRING,
        },
        address: {
            type: Sequelize.TEXT,
        },
        maxClass: {
            type: Sequelize.STRING,
            defaultValue: '12TH',
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
    console.log('✅ [Migration] "SchoolInfos" table created successfully.');
}

export async function down(queryInterface, Sequelize) {
    console.log('⚙️ [Migration] Dropping "SchoolInfos" table...');
    await queryInterface.dropTable('SchoolInfos');
    console.log('✅ [Migration] "SchoolInfos" table dropped.');
}
