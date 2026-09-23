import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ComplianceDoc = sequelize.define('ComplianceDoc', {
  title: { type: DataTypes.STRING },
  category: { type: DataTypes.STRING },
  url: { type: DataTypes.STRING },
  uploadDate: { type: DataTypes.STRING }
}, {
  tableName: 'ComplianceDocs',
  timestamps: true
});

export default ComplianceDoc;
