import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const WebBanner = sequelize.define('WebBanner', {
  image_url: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  title: { 
    type: DataTypes.STRING, 
    allowNull: true 
  },
  description: { 
    type: DataTypes.TEXT, 
    allowNull: true 
  },
  body: { 
    type: DataTypes.TEXT, 
    allowNull: true 
  },
  action_route: { 
    type: DataTypes.STRING, 
    allowNull: true 
  },
  status: { 
    type: DataTypes.STRING, 
    allowNull: false, 
    defaultValue: 'ACTIVE' 
  },
  display_order: { 
    type: DataTypes.INTEGER, 
    allowNull: false, 
    defaultValue: 0 
  }
}, {
  tableName: 'WebBanners',
  timestamps: true
});

export default WebBanner;
