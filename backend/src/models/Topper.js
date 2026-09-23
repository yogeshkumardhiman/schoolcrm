import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Topper = sequelize.define('Topper', {
  name: { type: DataTypes.STRING },
  class: { type: DataTypes.STRING },
  percentage: { type: DataTypes.STRING },
  session: { type: DataTypes.STRING },
  rank: { type: DataTypes.INTEGER },
  image: { type: DataTypes.STRING }
}, {
  tableName: 'Toppers',
  timestamps: true
});

export default Topper;
