import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Event = sequelize.define('Event', {
  title: { type: DataTypes.STRING },
  date: { type: DataTypes.STRING },
  time: { type: DataTypes.STRING },
  location: { type: DataTypes.STRING },
  participants: { type: DataTypes.STRING },
  color: { type: DataTypes.STRING, defaultValue: '#4F46E5' },
  icon: { type: DataTypes.STRING },
  description: { type: DataTypes.TEXT },
  type: { type: DataTypes.STRING, defaultValue: 'EVENT' },
  endDate: { type: DataTypes.STRING }
});

export default Event;
