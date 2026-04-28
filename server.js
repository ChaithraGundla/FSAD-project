const fs = require("fs");
const path = require("path");
const express = require("express");
const mysql = require("mysql2/promise");
require("dotenv").config();

const app = express();
const port = Number(process.env.PORT || 3000);
const publicDir = __dirname;
const requiredDbVars = ["DB_HOST", "DB_PORT", "DB_USER", "DB_NAME"];

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let pool;

function getMissingDbVars() {
  return requiredDbVars.filter((key) => !process.env[key]);
}

async function getPool() {
  if (pool) {
    return pool;
  }

  const missing = getMissingDbVars();
  if (missing.length) {
    throw new Error(`Missing database configuration: ${missing.join(", ")}`);
  }

  pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10
  });

  return pool;
}

async function runQuery(sql, params = []) {
  const db = await getPool();
  const [rows] = await db.execute(sql, params);
  return rows;
}

app.get("/api/health", async (req, res) => {
  try {
    await runQuery("SELECT 1 AS ok");
    res.json({ ok: true, database: "connected" });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
});

app.post("/api/contact-requests", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: "Name, email, and message are required." });
  }

  try {
    const result = await runQuery(
      `INSERT INTO contact_requests (name, email, message)
       VALUES (?, ?, ?)`,
      [name, email, message]
    );

    res.status(201).json({
      message: "Contact request saved successfully.",
      id: result.insertId
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/support-requests", async (req, res) => {
  const { requestType, contactMethod, message } = req.body;

  if (!requestType || !contactMethod || !message) {
    return res.status(400).json({ message: "All support request fields are required." });
  }

  try {
    const result = await runQuery(
      `INSERT INTO support_requests (request_type, contact_method, message)
       VALUES (?, ?, ?)`,
      [requestType, contactMethod, message]
    );

    res.status(201).json({
      message: "Support request stored successfully.",
      id: result.insertId
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/anonymous-reports", async (req, res) => {
  const { incidentType, incidentDate, details } = req.body;

  if (!incidentType || !incidentDate || !details) {
    return res.status(400).json({ message: "All anonymous report fields are required." });
  }

  try {
    const result = await runQuery(
      `INSERT INTO anonymous_reports (incident_type, incident_date, details)
       VALUES (?, ?, ?)`,
      [incidentType, incidentDate, details]
    );

    res.status(201).json({
      message: "Anonymous report stored successfully.",
      id: result.insertId
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/admin/requests", async (req, res) => {
  try {
    const [contactRequests, supportRequests, anonymousReports] = await Promise.all([
      runQuery(
        `SELECT id, name, email, message, created_at
         FROM contact_requests
         ORDER BY created_at DESC
         LIMIT 20`
      ),
      runQuery(
        `SELECT id, request_type AS requestType, contact_method AS contactMethod, message, created_at
         FROM support_requests
         ORDER BY created_at DESC
         LIMIT 20`
      ),
      runQuery(
        `SELECT id, incident_type AS incidentType, incident_date AS incidentDate, details, created_at
         FROM anonymous_reports
         ORDER BY created_at DESC
         LIMIT 20`
      )
    ]);

    res.json({ contactRequests, supportRequests, anonymousReports });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/setup/sql", (req, res) => {
  const schemaPath = path.join(__dirname, "setup.sql");
  const sql = fs.readFileSync(schemaPath, "utf8");
  res.type("text/plain").send(sql);
});

app.use(express.static(publicDir));

app.get("/", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

app.listen(port, () => {
  console.log(`SafeHaven server running at http://localhost:${port}`);
});
