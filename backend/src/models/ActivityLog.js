
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ActivityLog = sequelize.define('ActivityLog', {
  userId: { 
    type: DataTypes.INTEGER, 
    allowNull: true // Can be null for system actions or public uploads
  },
  userName: { 
    type: DataTypes.STRING,
    allowNull: true
  },
  userRole: {
    type: DataTypes.STRING,
    allowNull: true
  },
  action: { 
    type: DataTypes.STRING, 
    allowNull: false // e.g., 'CREATE', 'UPDATE', 'DELETE', 'LOGIN'
  },
  subject: { 
    type: DataTypes.STRING, 
    allowNull: false // e.g., 'Student', 'Fee', 'Role'
  },
  details: { 
    type: DataTypes.TEXT, 
    allowNull: true 
  },
  ipAddress: { 
    type: DataTypes.STRING, 
    allowNull: true 
  },
  status: {
    type: DataTypes.ENUM('SUCCESS', 'FAILURE'),
    defaultValue: 'SUCCESS'
  }
}, {
  tableName: 'ActivityLogs',
  timestamps: true,
  updatedAt: false // Only need createdAt for logs
});

export default ActivityLog;
