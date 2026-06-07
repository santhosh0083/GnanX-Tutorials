require('dotenv').config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const mongoUri = process.env.MONGODB_URI;
let db = null;
let mongoClientPromise = null;

if (!mongoUri) {
  console.error('MONGODB_URI is not set. Create a .env file or set the env variable.');
  process.exit(1);
}

async function getDb() {
  if (!mongoClientPromise) {
    const mongoClient = new MongoClient(mongoUri, {
      serverSelectionTimeoutMS: 10000
    });
    mongoClientPromise = mongoClient.connect();
  }

  if (!db) {
    const mongoClient = await mongoClientPromise;
    db = mongoClient.db(process.env.MONGODB_DB || "gnanx");
  }

  return db;
}

getDb()
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    mongoClientPromise = null;
    db = null;
    console.error("MongoDB connection failed:", err.message || err);
  });

async function withDb(res) {
  try {
    return await getDb();
  } catch (err) {
    mongoClientPromise = null;
    db = null;
    console.error("MongoDB connection failed:", err.message || err);
    res.status(500).json({
      success: false,
      error: "Unable to connect to MongoDB. Check MONGODB_URI and Atlas Network Access."
    });
    return null;
  }
}

app.get("/health", async (req, res) => {
  const database = await withDb(res);
  if (!database) return;

  return res.json({
    success: true,
    database: "connected"
  });
});

app.post("/student", async (req, res) => {
  // Basic validation
  if (!req.body || !req.body.studentName || !req.body.parentName || !req.body.parentEmail) {
    return res.status(400).json({ success: false, error: 'Missing required fields: studentName, parentName, parentEmail' });
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
    const database = await withDb(res);
    if (!database) return;

    await database.collection("students").insertOne(studentRecord);
    await database.collection("parents").insertOne(parentRecord);
    return res.json({ success: true });
  } catch (err) {
    console.error("Mongo insert error:", err);
    return res.status(500).json({ success: false });
  }
});

app.post("/tutor", async (req, res) => {
  // Basic validation
  if (!req.body || !req.body.name || !req.body.email) {
    return res.status(400).json({ success: false, error: 'Missing required fields: name, email' });
  }

  const record = { ...req.body, submittedAt: new Date().toISOString() };

  try {
    const database = await withDb(res);
    if (!database) return;

    await database.collection("tutors").insertOne(record);
    return res.json({ success: true });
  } catch (err) {
    console.error("Mongo insert tutor error:", err);
    return res.status(500).json({ success: false });
  }
});

app.get("/admin/students", async (req, res) => {
  try {
    const database = await withDb(res);
    if (!database) return;

    const rows = await database.collection("students").find().toArray();
    return res.json(rows);
  } catch (err) {
    console.error("Mongo read students error:", err);
    return res.status(500).json({ success: false });
  }
});

app.get("/admin/parents", async (req, res) => {
  try {
    const database = await withDb(res);
    if (!database) return;

    const rows = await database.collection("parents").find().toArray();
    return res.json(rows);
  } catch (err) {
    console.error("Mongo read parents error:", err);
    return res.status(500).json({ success: false });
  }
});

app.get("/admin/tutors", async (req, res) => {
  try {
    const database = await withDb(res);
    if (!database) return;

    const rows = await database.collection("tutors").find().toArray();
    return res.json(rows);
  } catch (err) {
    console.error("Mongo read tutors error:", err);
    return res.status(500).json({ success: false });
  }
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
