import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const SchoolInfo = sequelize.define('SchoolInfo', {
  aboutTitle: { type: DataTypes.STRING },
  aboutDescription: { type: DataTypes.TEXT },
  mission: { type: DataTypes.TEXT },
  vision: { type: DataTypes.TEXT },
  principalMessage: { type: DataTypes.TEXT },
  contactEmail: { type: DataTypes.STRING },
  contactPhone: { type: DataTypes.STRING },
  address: { type: DataTypes.TEXT },
  maxClass: { type: DataTypes.STRING, defaultValue: '12TH' },
  schoolName: { type: DataTypes.STRING },
  logoImage: { type: DataTypes.STRING },
  domainPrefix: { type: DataTypes.STRING },
  primaryColor: { type: DataTypes.STRING },
  secondaryColor: { type: DataTypes.STRING },
  bannerTitle: { type: DataTypes.STRING },
  bannerImage: { type: DataTypes.STRING },
  principalName: { type: DataTypes.STRING },
  principalImage: { type: DataTypes.STRING },
  phone: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING },
  active_features: { type: DataTypes.JSONB },
  top_info_bar: { type: DataTypes.JSONB },
  theme_config: { type: DataTypes.JSONB },
  homepage_layout: { type: DataTypes.JSONB },
  statistics: { type: DataTypes.JSONB },
  why_choose_us: { type: DataTypes.JSONB },
  director_message: { type: DataTypes.JSONB },
  academics_config: { type: DataTypes.JSONB },
  campus_tour: { type: DataTypes.JSONB },
  admission_timeline: { type: DataTypes.JSONB },
  facilities_config: { type: DataTypes.JSONB },
  faqs_config: { type: DataTypes.JSONB },
  cta_config: { type: DataTypes.JSONB },
  footer_config: { type: DataTypes.JSONB },
  floating_buttons: { type: DataTypes.JSONB },
  navbar_config: { type: DataTypes.JSONB }
}, {
  tableName: 'SchoolInfos',
  timestamps: true
});

export default SchoolInfo;
