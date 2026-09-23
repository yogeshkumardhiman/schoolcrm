import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

import { SchoolSettings, SchoolInfo, sequelize } from './src/models/index.js';

async function check() {
  try {
    await sequelize.authenticate();
    console.log('📡 Connected successfully.');
    
    const settings = await SchoolSettings.findOne();
    const info = await SchoolInfo.findOne();
    
    console.log('\n--- SchoolSettings (Mobile Settings) ---');
    if (settings) {
      console.log(`ID: ${settings.id}`);
      console.log(`school_name: ${settings.school_name}`);
      console.log(`app_title: ${settings.app_title}`);
      console.log(`logo_url: ${settings.logo_url}`);
      console.log(`primary_color: ${settings.primary_color}`);
      console.log(`secondary_color: ${settings.secondary_color}`);
    } else {
      console.log('No SchoolSettings found in DB.');
    }

    console.log('\n--- SchoolInfo (Portal/Web Settings) ---');
    if (info) {
      console.log(`ID: ${info.id}`);
      console.log(`schoolName: ${info.schoolName}`);
      console.log(`aboutTitle: ${info.aboutTitle}`);
      console.log(`logoImage: ${info.logoImage}`);
      console.log(`primaryColor: ${info.primaryColor}`);
      console.log(`secondaryColor: ${info.secondaryColor}`);
    } else {
      console.log('No SchoolInfo found in DB.');
    }

  } catch (e) {
    console.error('❌ Error checking DB:', e);
  } finally {
    await sequelize.close();
  }
}

check();
