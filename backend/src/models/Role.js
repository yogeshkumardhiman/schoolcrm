import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Role = sequelize.define('Role', {
  name: { 
    type: DataTypes.STRING, 
    unique: true, 
    allowNull: false 
  },
  description: { 
    type: DataTypes.STRING 
  },
  rules: { 
    type: DataTypes.JSONB, 
    defaultValue: [] 
  },
  isActive: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: true 
  }
}, {
  tableName: 'Roles',
  timestamps: true
});

export default Role;
