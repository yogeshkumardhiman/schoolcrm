export async function up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    if (tables.includes('SubstitutionAssignments')) {
        console.log('⚠️ [Migration] Table "SubstitutionAssignments" already exists. Skipping creation.');
        return;
    }

    console.log('⚙️ [Migration] Creating "SubstitutionAssignments" table...');
    await queryInterface.createTable('SubstitutionAssignments', {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        absentTeacherId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'Staffs',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'NO ACTION',
        },
        substituteTeacherId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'Staffs',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'NO ACTION',
        },
        date: {
            type: Sequelize.STRING,
        },
        period: {
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
    console.log('✅ [Migration] "SubstitutionAssignments" table created successfully.');
}

export async function down(queryInterface, Sequelize) {
    console.log('⚙️ [Migration] Dropping "SubstitutionAssignments" table...');
    await queryInterface.dropTable('SubstitutionAssignments');
    console.log('✅ [Migration] "SubstitutionAssignments" table dropped.');
}
