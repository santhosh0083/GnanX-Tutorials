import { MongoClient } from "mongodb";

let clientPromise;

function getClient() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is not configured");
  }

  if (!clientPromise) {
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 10000
    });
    clientPromise = client.connect();
  }

  return clientPromise;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  if (!req.body || !req.body.studentName || !req.body.parentName || !req.body.parentEmail) {
    return res.status(400).json({
      success: false,
      error: "Missing required fields: studentName, parentName, parentEmail"
    });
  }

  const submittedAt = new Date().toISOString();
  const studentRecord = { ...req.body, submittedAt };
  const parentRecord = {
    parentName: req.body.parentName,
    parentPhone: req.body.parentPhone,
    parentEmail: req.body.parentEmail,
    studentName: req.body.studentName,
    submittedAt
  };

  try {
    const client = await getClient();
    const db = client.db(process.env.MONGODB_DB || "gnanx");
    await db.collection("students").insertOne(studentRecord);
    await db.collection("parents").insertOne(parentRecord);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Mongo insert student error:", error);
    return res.status(500).json({
      success: false,
      error: "Unable to store student enquiry"
    });
  }
}
