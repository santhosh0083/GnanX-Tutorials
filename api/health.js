import { MongoClient } from "mongodb";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    return res.status(500).json({
      success: false,
      database: "error",
      error: "MONGODB_URI is not configured"
    });
  }

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 10000
  });

  try {
    await client.connect();
    return res.status(200).json({ success: true, database: "connected" });
  } catch (error) {
    console.error("Mongo health check error:", error);
    return res.status(500).json({
      success: false,
      database: "error",
      error: "Unable to connect to MongoDB"
    });
  } finally {
    await client.close().catch(() => {});
  }
}
