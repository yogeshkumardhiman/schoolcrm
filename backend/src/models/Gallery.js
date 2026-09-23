import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Gallery = sequelize.define('Gallery', {
  title: { type: DataTypes.STRING },
  url: { type: DataTypes.STRING },
  category: { type: DataTypes.STRING }
}, {
  tableName: 'Galleries',
  timestamps: true
});

export default Gallery;
