export async function up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    if (tables.includes('Admins')) {
        console.log('⚠️ [Migration] Table "Admins" already exists. Skipping creation.');
        return;
    }

    console.log('⚙️ [Migration] Creating "Admins" table...');
    await queryInterface.createTable('Admins', {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: Sequelize.STRING,
            defaultValue: 'Administrator',
        },
        email: {
            type: Sequelize.STRING,
            unique: true,
        },
        password: {
            type: Sequelize.STRING,
        },
        role: {
            type: Sequelize.STRING,
            defaultValue: 'ADMISSION_ADMIN',
        },
        image: {
            type: Sequelize.STRING,
        },
        phone: {
            type: Sequelize.STRING,
        },
        about: {
            type: Sequelize.TEXT,
        },
        address: {
            type: Sequelize.TEXT,
        },
        dob: {
            type: Sequelize.STRING,
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
        permissions: {
            type: Sequelize.JSONTYPE,
            defaultValue: {"canViewStudents":true,"canEditStudents":true,"canAddMarks":true,"canMarkAttendance":true,"canViewFees":true,"isSuperAdmin":false},
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
    console.log('✅ [Migration] "Admins" table created successfully.');
}

export async function down(queryInterface, Sequelize) {
    console.log('⚙️ [Migration] Dropping "Admins" table...');
    await queryInterface.dropTable('Admins');
    console.log('✅ [Migration] "Admins" table dropped.');
}
