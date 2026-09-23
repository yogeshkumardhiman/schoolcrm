export async function up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    if (tables.includes('Students')) {
        console.log('⚠️ [Migration] Table "Students" already exists. Skipping creation.');
        return;
    }

    console.log('⚙️ [Migration] Creating "Students" table...');
    await queryInterface.createTable('Students', {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: Sequelize.STRING,
        },
        class: {
            type: Sequelize.STRING,
        },
        rollNo: {
            type: Sequelize.STRING,
        },
        phone: {
            type: Sequelize.STRING,
        },
        fatherName: {
            type: Sequelize.STRING,
        },
        motherName: {
            type: Sequelize.STRING,
        },
        dob: {
            type: Sequelize.STRING,
        },
        gender: {
            type: Sequelize.STRING,
        },
        address: {
            type: Sequelize.TEXT,
        },
        admissionNo: {
            type: Sequelize.STRING,
        },
        email: {
            type: Sequelize.STRING,
        },
        bloodGroup: {
            type: Sequelize.STRING,
        },
        section: {
            type: Sequelize.STRING,
            defaultValue: 'A',
        },
        feesStatus: {
            type: Sequelize.STRING,
            defaultValue: 'PENDING',
        },
        image: {
            type: Sequelize.STRING,
        },
        session: {
            type: Sequelize.STRING,
        },
        aadharNo: {
            type: Sequelize.STRING,
        },
        password: {
            type: Sequelize.STRING,
        },
        religion: {
            type: Sequelize.STRING,
            defaultValue: 'HINDU',
        },
        transportOpted: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        },
        transportStopId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'TransportStops',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
        },
        transportRouteId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'TransportRoutes',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
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
    console.log('✅ [Migration] "Students" table created successfully.');
}

export async function down(queryInterface, Sequelize) {
    console.log('⚙️ [Migration] Dropping "Students" table...');
    await queryInterface.dropTable('Students');
    console.log('✅ [Migration] "Students" table dropped.');
}
