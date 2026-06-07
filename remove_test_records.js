require('dotenv').config();
const { MongoClient } = require('mongodb');

const mongoUri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'gnanx';

if (!mongoUri) {
  console.error('MONGODB_URI not set in .env');
  process.exit(1);
}

async function run() {
  const client = new MongoClient(mongoUri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const studentsDel = await db.collection('students').deleteMany({ studentName: { $in: ['AutoTest','FinalTest','YouTest'] } });
    const parentsDel = await db.collection('parents').deleteMany({ parentEmail: { $in: ['auto@local','final@local','you@local'] } });
    console.log('Deleted students:', studentsDel.deletedCount);
    console.log('Deleted parents:', parentsDel.deletedCount);
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

run();
