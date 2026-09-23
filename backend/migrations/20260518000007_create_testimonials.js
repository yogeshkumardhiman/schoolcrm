export async function up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    if (tables.includes('Testimonials')) {
        console.log('⚠️ [Migration] Table "Testimonials" already exists. Skipping creation.');
        return;
    }

    console.log('⚙️ [Migration] Creating "Testimonials" table...');
    await queryInterface.createTable('Testimonials', {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: Sequelize.STRING,
        },
        role: {
            type: Sequelize.STRING,
        },
        text: {
            type: Sequelize.TEXT,
        },
        image: {
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
    console.log('✅ [Migration] "Testimonials" table created successfully.');
}

export async function down(queryInterface, Sequelize) {
    console.log('⚙️ [Migration] Dropping "Testimonials" table...');
    await queryInterface.dropTable('Testimonials');
    console.log('✅ [Migration] "Testimonials" table dropped.');
}
