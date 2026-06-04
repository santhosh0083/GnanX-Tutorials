const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const dataDir = path.join(__dirname, "data");
const studentFile = path.join(dataDir, "students.json");
const parentFile = path.join(dataDir, "parents.json");
const tutorFile = path.join(dataDir, "tutors.json");

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

app.post("/student", (req, res) => {
  const submittedAt = new Date().toISOString();
  const studentRecord = {
    ...req.body,
    submittedAt
  };
  const parentRecord = {
    parentName: req.body.parentName,
    parentPhone: req.body.parentPhone,
    parentEmail: req.body.parentEmail,
    studentName: req.body.studentName,
    submittedAt
  };

  const students = readData(studentFile);
  students.push(studentRecord);
  saveData(studentFile, students);

  const parents = readData(parentFile);
  parents.push(parentRecord);
  saveData(parentFile, parents);

  res.json({ success: true });
});

app.post("/tutor", (req, res) => {
  const data = readData(tutorFile);
  data.push({
    ...req.body,
    submittedAt: new Date().toISOString()
  });
  saveData(tutorFile, data);
  res.json({ success: true });
});

app.get("/admin/students", (req, res) => {
  res.json(readData(studentFile));
});

app.get("/admin/parents", (req, res) => {
  res.json(readData(parentFile));
});

app.get("/admin/tutors", (req, res) => {
  res.json(readData(tutorFile));
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
