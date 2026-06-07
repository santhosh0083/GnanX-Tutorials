const { getDb } = require("./_mongo");

module.exports = async function handler(req, res) {
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
    const db = await getDb();
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
};
