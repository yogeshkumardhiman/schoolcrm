import { Notice } from './src/models/index.js';
async function test() {
   const notice = await Notice.findOne({ order: [['id', 'DESC']] });
   console.log(JSON.stringify(notice, null, 2));
   process.exit(0);
}
test();
