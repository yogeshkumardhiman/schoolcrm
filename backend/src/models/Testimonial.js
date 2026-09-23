import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Testimonial = sequelize.define('Testimonial', {
  name: { type: DataTypes.STRING },
  role: { type: DataTypes.STRING },
  text: { type: DataTypes.TEXT },
  image: { type: DataTypes.STRING }
});

export default Testimonial;
