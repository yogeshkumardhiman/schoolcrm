export async function up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    if (tables.includes('Staffs')) {
        console.log('⚠️ [Migration] Table "Staffs" already exists. Skipping creation.');
        return;
    }

    console.log('⚙️ [Migration] Creating "Staffs" table...');
    await queryInterface.createTable('Staffs', {
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
        designation: {
            type: Sequelize.STRING,
        },
        subject: {
            type: Sequelize.STRING,
        },
        image: {
            type: Sequelize.STRING,
        },
        phone: {
            type: Sequelize.STRING,
        },
        email: {
            type: Sequelize.STRING,
        },
        qualification: {
            type: Sequelize.STRING,
        },
        experience: {
            type: Sequelize.STRING,
        },
        joiningDate: {
            type: Sequelize.STRING,
        },
        class: {
            type: Sequelize.STRING,
        },
        section: {
            type: Sequelize.STRING,
            defaultValue: 'A',
        },
        password: {
            type: Sequelize.STRING,
            defaultValue: 'teacher123',
        },
        about: {
            type: Sequelize.TEXT,
        },
        address: {
            type: Sequelize.TEXT,
        },
        gender: {
            type: Sequelize.STRING,
        },
        dob: {
            type: Sequelize.STRING,
        },
        permissions: {
            type: Sequelize.JSONB,
            defaultValue: [],
        },
        roleId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'Roles',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
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
    console.log('✅ [Migration] "Staffs" table created successfully.');
}

export async function down(queryInterface, Sequelize) {
    console.log('⚙️ [Migration] Dropping "Staffs" table...');
    await queryInterface.dropTable('Staffs');
    console.log('✅ [Migration] "Staffs" table dropped.');
}
