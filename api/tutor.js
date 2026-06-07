const { getDb } = require("./_mongo");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  if (!req.body || !req.body.name || !req.body.email) {
    return res.status(400).json({
      success: false,
      error: "Missing required fields: name, email"
    });
  }

  const record = { ...req.body, submittedAt: new Date().toISOString() };

  try {
    const db = await getDb();
    await db.collection("tutors").insertOne(record);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Mongo insert tutor error:", error);
    return res.status(500).json({
      success: false,
      error: "Unable to store tutor application"
    });
  }
};
