export async function up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('Fees');
    
    if (!tableInfo.frequency) {
        console.log('⚙️ [Migration] Adding "frequency" column to "Fees" table...');
        await queryInterface.addColumn('Fees', 'frequency', {
            type: Sequelize.ENUM('MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'YEARLY', 'ONE_TIME'),
            allowNull: false,
            defaultValue: 'MONTHLY'
        });
    }

    if (!tableInfo.isOptional) {
        console.log('⚙️ [Migration] Adding "isOptional" column to "Fees" table...');
        await queryInterface.addColumn('Fees', 'isOptional', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
        });
    }

    if (!tableInfo.collectOnAdmission) {
        console.log('⚙️ [Migration] Adding "collectOnAdmission" column to "Fees" table...');
        await queryInterface.addColumn('Fees', 'collectOnAdmission', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true
        });
    }
}

export async function down(queryInterface, Sequelize) {
    console.log('⚙️ [Migration] Removing billing fields from "Fees" table...');
    await queryInterface.removeColumn('Fees', 'frequency');
    await queryInterface.removeColumn('Fees', 'isOptional');
    await queryInterface.removeColumn('Fees', 'collectOnAdmission');
}
