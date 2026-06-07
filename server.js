const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const dataDir = path.join(__dirname, "data");
const studentFile = path.join(dataDir, "students.json");
const parentFile = path.join(dataDir, "parents.json");
const tutorFile = path.join(dataDir, "tutors.json");

const mongoUri = process.env.MONGODB_URI || null;
let mongoClient = null;
let db = null;

async function initMongo() {
  if (!mongoUri) return;
  try {
    mongoClient = new MongoClient(mongoUri);
    await mongoClient.connect();
    db = mongoClient.db(process.env.MONGODB_DB || "gnanx");
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message || err);
    mongoClient = null;
    db = null;
  }
}

initMongo();

function readData(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return [];
  }
}

function saveData(file, data) {
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

app.post("/student", async (req, res) => {
  const submittedAt = new Date().toISOString();
  const studentRecord = { ...req.body, submittedAt };
  const parentRecord = {
    parentName: req.body.parentName,
    parentPhone: req.body.parentPhone,
    parentEmail: req.body.parentEmail,
    studentName: req.body.studentName,
    submittedAt
  };

  if (db) {
    try {
      await db.collection("students").insertOne(studentRecord);
      await db.collection("parents").insertOne(parentRecord);
      return res.json({ success: true });
    } catch (err) {
      console.error("Mongo insert error:", err);
      // fallthrough to file fallback
    }
  }

  const students = readData(studentFile);
  students.push(studentRecord);
  saveData(studentFile, students);

  const parents = readData(parentFile);
  parents.push(parentRecord);
  saveData(parentFile, parents);

  res.json({ success: true });
});

app.post("/tutor", async (req, res) => {
  const record = { ...req.body, submittedAt: new Date().toISOString() };

  if (db) {
    try {
      await db.collection("tutors").insertOne(record);
      return res.json({ success: true });
    } catch (err) {
      console.error("Mongo insert tutor error:", err);
      // fallthrough to file fallback
    }
  }

  const data = readData(tutorFile);
  data.push(record);
  saveData(tutorFile, data);
  res.json({ success: true });
});

app.get("/admin/students", async (req, res) => {
  if (db) {
    try {
      const rows = await db.collection("students").find().toArray();
      return res.json(rows);
    } catch (err) {
      console.error("Mongo read students error:", err);
    }
  }
  res.json(readData(studentFile));
});

app.get("/admin/parents", async (req, res) => {
  if (db) {
    try {
      const rows = await db.collection("parents").find().toArray();
      return res.json(rows);
    } catch (err) {
      console.error("Mongo read parents error:", err);
    }
  }
  res.json(readData(parentFile));
});

app.get("/admin/tutors", async (req, res) => {
  if (db) {
    try {
      const rows = await db.collection("tutors").find().toArray();
      return res.json(rows);
    } catch (err) {
      console.error("Mongo read tutors error:", err);
    }
  }
  res.json(readData(tutorFile));
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
