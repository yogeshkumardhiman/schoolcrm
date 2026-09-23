export async function up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    if (tables.includes('Homework')) {
        console.log('⚠️ [Migration] Table "Homework" already exists. Skipping creation.');
        return;
    }

    console.log('⚙️ [Migration] Creating "Homework" table...');
    await queryInterface.createTable('Homework', {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        title: {
            type: Sequelize.STRING,
        },
        subject: {
            type: Sequelize.STRING,
        },
        date: {
            type: Sequelize.STRING,
        },
        dueDate: {
            type: Sequelize.STRING,
        },
        class: {
            type: Sequelize.STRING,
        },
        section: {
            type: Sequelize.STRING,
        },
        content: {
            type: Sequelize.TEXT,
        },
        teacherId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'Staffs',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        },
        teacherName: {
            type: Sequelize.STRING,
        },
        priority: {
            type: Sequelize.ENUM('LOW', 'MEDIUM', 'HIGH'),
            defaultValue: 'MEDIUM',
        },
        isUrgent: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        },
        status: {
            type: Sequelize.ENUM('ACTIVE', 'ARCHIVED', 'DRAFT'),
            defaultValue: 'ACTIVE',
        },
        attachments: {
            type: Sequelize.JSONTYPE,
        },
        session: {
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
    console.log('✅ [Migration] "Homework" table created successfully.');
}

export async function down(queryInterface, Sequelize) {
    console.log('⚙️ [Migration] Dropping "Homework" table...');
    await queryInterface.dropTable('Homework');
    console.log('✅ [Migration] "Homework" table dropped.');
}
