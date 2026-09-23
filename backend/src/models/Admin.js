import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Admin = sequelize.define('Admin', {
  name: { type: DataTypes.STRING, defaultValue: 'Administrator' },
  email: { type: DataTypes.STRING, unique: true },
  password: { type: DataTypes.STRING }, 
  role: { type: DataTypes.STRING, defaultValue: 'ADMISSION_ADMIN' },
  image: { type: DataTypes.STRING },
  phone: { type: DataTypes.STRING },
  about: { type: DataTypes.TEXT },
  address: { type: DataTypes.TEXT },
  dob: { type: DataTypes.STRING },
  roleId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Roles',
      key: 'id'
    }
  },
  permissions: {
    type: DataTypes.JSON,
    defaultValue: {
      canViewStudents: true, canEditStudents: true,
      canAddMarks: true, canMarkAttendance: true, canViewFees: true,
      isSuperAdmin: false
    }
  },
  deviceToken: { type: DataTypes.STRING, allowNull: true }
});

export default Admin;
