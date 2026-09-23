import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const SubstitutionAssignment = sequelize.define('SubstitutionAssignment', {
  absentTeacherId: { type: DataTypes.INTEGER },
  substituteTeacherId: { type: DataTypes.INTEGER },
  date: { type: DataTypes.STRING },
  period: { type: DataTypes.STRING },
  class: { type: DataTypes.STRING },
  section: { type: DataTypes.STRING }
});

export default SubstitutionAssignment;
