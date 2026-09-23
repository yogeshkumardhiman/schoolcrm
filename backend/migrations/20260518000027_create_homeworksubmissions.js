export async function up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    if (tables.includes('HomeworkSubmissions')) {
        console.log('⚠️ [Migration] Table "HomeworkSubmissions" already exists. Skipping creation.');
        return;
    }

    console.log('⚙️ [Migration] Creating "HomeworkSubmissions" table...');
    await queryInterface.createTable('HomeworkSubmissions', {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        homeworkId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'Homework',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        },
        studentId: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        studentName: {
            type: Sequelize.STRING,
        },
        status: {
            type: Sequelize.ENUM('PENDING', 'SUBMITTED', 'COMPLETED'),
            defaultValue: 'PENDING',
        },
        submittedAt: {
            type: Sequelize.STRING,
        },
        content: {
            type: Sequelize.TEXT,
        },
        attachmentUrl: {
            type: Sequelize.STRING,
        },
        feedback: {
            type: Sequelize.TEXT,
        },
        grade: {
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
    console.log('✅ [Migration] "HomeworkSubmissions" table created successfully.');
}

export async function down(queryInterface, Sequelize) {
    console.log('⚙️ [Migration] Dropping "HomeworkSubmissions" table...');
    await queryInterface.dropTable('HomeworkSubmissions');
    console.log('✅ [Migration] "HomeworkSubmissions" table dropped.');
}
