import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Staff = sequelize.define('Staff', {
  name: { type: DataTypes.STRING },
  role: { type: DataTypes.STRING },
  designation: { type: DataTypes.STRING },
  subject: { type: DataTypes.STRING },
  image: { type: DataTypes.STRING },
  phone: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING, unique: true },
  qualification: { type: DataTypes.STRING },
  experience: { type: DataTypes.STRING },
  joiningDate: { type: DataTypes.STRING },
  class: { type: DataTypes.STRING },
  section: { type: DataTypes.STRING, defaultValue: 'A' },
  password: { type: DataTypes.STRING, defaultValue: 'teacher123' },
  about: { type: DataTypes.TEXT },
  address: { type: DataTypes.TEXT },
  gender: { type: DataTypes.STRING },
  dob: { type: DataTypes.STRING },
  permissions: { type: DataTypes.JSONB, defaultValue: [] },
  can_manage_app_settings: { type: DataTypes.BOOLEAN, defaultValue: false },
  roleId: { 
    type: DataTypes.INTEGER,
    references: {
      model: 'Roles',
      key: 'id'
    }
  },
  deviceToken: { type: DataTypes.STRING, allowNull: true }
}, {
  tableName: 'Staffs',
  timestamps: true
});

Staff.associate = (models) => {
  Staff.belongsTo(models.Role, { foreignKey: 'roleId', as: 'dynamicRole' });
};

export default Staff;
