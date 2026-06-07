const { MongoClient } = require("mongodb");

let clientPromise;

function getMongoUri() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("MONGODB_URI is not configured");
  }

  return mongoUri;
}

async function getDb() {
  if (!clientPromise) {
    const client = new MongoClient(getMongoUri(), {
      serverSelectionTimeoutMS: 10000
    });
    clientPromise = client.connect();
  }

  const client = await clientPromise;
  return client.db(process.env.MONGODB_DB || "gnanx");
}

module.exports = { getDb };
