import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Student = sequelize.define('Student', {
  name: { type: DataTypes.STRING },
  class: { type: DataTypes.STRING },
  rollNo: { type: DataTypes.STRING },
  phone: { type: DataTypes.STRING },
  fatherName: { type: DataTypes.STRING },
  motherName: { type: DataTypes.STRING },
  dob: { type: DataTypes.STRING },
  gender: { type: DataTypes.STRING },
  address: { type: DataTypes.TEXT },
  admissionNo: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING },
  bloodGroup: { type: DataTypes.STRING },
  section: { type: DataTypes.STRING, defaultValue: 'A' },
  feesStatus: { type: DataTypes.STRING, defaultValue: 'PENDING' },
  image: { type: DataTypes.STRING },
  session: { type: DataTypes.STRING },
  aadharNo: { type: DataTypes.STRING },
  password: { type: DataTypes.STRING },
  religion: { type: DataTypes.STRING, defaultValue: 'HINDU' },
  transportOpted: { type: DataTypes.BOOLEAN, defaultValue: false },
  transportStopId: { type: DataTypes.INTEGER, allowNull: true },
  transportRouteId: { type: DataTypes.INTEGER, allowNull: true },
  deviceToken: { type: DataTypes.STRING, allowNull: true }
}, {
  tableName: 'Students',
  timestamps: true
});

Student.beforeValidate((student) => {
  if (student.transportRouteId === "") {
    student.transportRouteId = null;
  }
  if (student.transportStopId === "") {
    student.transportStopId = null;
  }
});

export default Student;
