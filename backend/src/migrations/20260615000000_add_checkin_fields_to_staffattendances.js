export async function up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('StaffAttendances');
    if (!tableInfo.checkInTime) {
        console.log('⚙️ [Migration] Adding checkInTime column to StaffAttendances...');
        await queryInterface.addColumn('StaffAttendances', 'checkInTime', {
            type: Sequelize.STRING,
            allowNull: true
        });
    }
    if (!tableInfo.checkOutTime) {
        console.log('⚙️ [Migration] Adding checkOutTime column to StaffAttendances...');
        await queryInterface.addColumn('StaffAttendances', 'checkOutTime', {
            type: Sequelize.STRING,
            allowNull: true
        });
    }
    if (!tableInfo.workingHours) {
        console.log('⚙️ [Migration] Adding workingHours column to StaffAttendances...');
        await queryInterface.addColumn('StaffAttendances', 'workingHours', {
            type: Sequelize.STRING,
            allowNull: true
        });
    }
}

export async function down(queryInterface, Sequelize) {
    console.log('⚙️ [Migration] Removing checkInTime, checkOutTime, and workingHours columns from StaffAttendances...');
    await queryInterface.removeColumn('StaffAttendances', 'checkInTime');
    await queryInterface.removeColumn('StaffAttendances', 'checkOutTime');
    await queryInterface.removeColumn('StaffAttendances', 'workingHours');
}
