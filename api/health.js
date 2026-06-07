const { getDb } = require("./_mongo");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    await getDb();
    return res.status(200).json({ success: true, database: "connected" });
  } catch (error) {
    console.error("Mongo health check error:", error);
    return res.status(500).json({
      success: false,
      database: "error",
      error: "Unable to connect to MongoDB"
    });
  }
};
