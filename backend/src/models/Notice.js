import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Notice = sequelize.define('Notice', {
  title: { type: DataTypes.STRING },
  content: { type: DataTypes.TEXT },
  tag: { type: DataTypes.STRING },
  color: { type: DataTypes.STRING },
  date: { type: DataTypes.STRING },
  session: { type: DataTypes.STRING },
  class: { type: DataTypes.STRING, allowNull: true },
  section: { type: DataTypes.STRING, allowNull: true },
  studentId: { type: DataTypes.INTEGER, allowNull: true },
  // Role-based routing fields
  targetRole: { type: DataTypes.STRING, allowNull: true, defaultValue: null }, // null = ALL, 'TEACHER', 'ACCOUNTANT', 'PRINCIPAL', etc.
  createdByRole: { type: DataTypes.STRING, allowNull: true },
  createdById: { type: DataTypes.INTEGER, allowNull: true },
  isRead: { type: DataTypes.BOOLEAN, defaultValue: false }
}, {
  tableName: 'Notices',
  timestamps: true
});

export default Notice;
