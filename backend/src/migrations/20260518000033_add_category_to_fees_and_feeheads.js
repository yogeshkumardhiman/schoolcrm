export async function up(queryInterface, Sequelize) {
  const feesDesc = await queryInterface.describeTable('Fees');
  if (!feesDesc.category) {
    await queryInterface.addColumn('Fees', 'category', {
      type: Sequelize.ENUM('ADMISSION', 'RECURRING', 'TRANSPORT', 'OPTIONAL'),
      allowNull: false,
      defaultValue: 'RECURRING'
    });
  }

  const headsDesc = await queryInterface.describeTable('FeeHeads');
  if (!headsDesc.category) {
    await queryInterface.addColumn('FeeHeads', 'category', {
      type: Sequelize.ENUM('ADMISSION', 'RECURRING', 'TRANSPORT', 'OPTIONAL'),
      allowNull: false,
      defaultValue: 'RECURRING'
    });
  }
}

export async function down(queryInterface, Sequelize) {
  const feesDesc = await queryInterface.describeTable('Fees');
  if (feesDesc.category) {
    await queryInterface.removeColumn('Fees', 'category');
  }

  const headsDesc = await queryInterface.describeTable('FeeHeads');
  if (headsDesc.category) {
    await queryInterface.removeColumn('FeeHeads', 'category');
  }
}
