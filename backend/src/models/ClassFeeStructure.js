import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ClassFeeStructure = sequelize.define('ClassFeeStructure', {
  class: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  feeHeadId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'FeeHeads',
      key: 'id'
    }
  },
  amount: { 
    type: DataTypes.DECIMAL(10, 2), 
    defaultValue: 0 
  }
});

export default ClassFeeStructure;
