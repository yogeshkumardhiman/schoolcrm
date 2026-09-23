import { SchoolInfo } from './src/models/index.js';
async function test() {
   const info = await SchoolInfo.findOne();
   console.log("Logo URL:", info?.logoUrl);
   process.exit(0);
}
test();
