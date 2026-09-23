import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const SchoolSettings = sequelize.define('SchoolSettings', {
  school_name: { 
    type: DataTypes.STRING, 
    allowNull: false, 
    defaultValue: 'School Name' 
  },
  app_title: { 
    type: DataTypes.STRING, 
    allowNull: false, 
    defaultValue: 'School App' 
  },
  primary_color: { 
    type: DataTypes.STRING, 
    allowNull: false, 
    defaultValue: '#6C63FF' 
  },
  secondary_color: { 
    type: DataTypes.STRING, 
    allowNull: false, 
    defaultValue: '#8B5CF6' 
  },
  logo_url: { 
    type: DataTypes.STRING, 
    allowNull: true 
  },
  active_features: { 
    type: DataTypes.JSONB, 
    allowNull: false, 
    defaultValue: ['fees', 'homework', 'exams', 'notice', 'timetable', 'calendar', 'helpdesk', 'profile'] 
  },
  maintenance_mode: { 
    type: DataTypes.BOOLEAN, 
    allowNull: false, 
    defaultValue: false 
  },
  emergency_alert: { 
    type: DataTypes.JSONB, 
    allowNull: false, 
    defaultValue: { active: false, title: '', message: '' } 
  },
  enableOnlinePayments: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  razorpayKeyId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  razorpayKeySecret: {
    type: DataTypes.STRING,
    allowNull: true
  },
  favorite_colors: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: []
  },
  timings: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {
      summer: { startTime: '07:30', endTime: '13:30', label: 'Summer Timing', months: 'April – September' },
      winter: { startTime: '09:00', endTime: '15:00', label: 'Winter Timing', months: 'October – March' }
    }
  }
}, {
  tableName: 'SchoolSettings',
  timestamps: true
});

export default SchoolSettings;
