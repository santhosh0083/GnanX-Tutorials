import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const client = new MongoClient(uri);

    await client.connect();

    const db = client.db("gnanx");
    const collection = db.collection("students");

    await collection.insertOne({
      ...req.body,
      createdAt: new Date()
    });

    await client.close();

    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
}