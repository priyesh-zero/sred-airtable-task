require("dotenv").config();
const cookieParser = require("cookie-parser");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const authMiddleware = require("./middleware/auth");

const airtableAuthRoutes = require("./routes/auth-routes");
const scraperRoutes = require('./routes/scraper-routes');
const jobRoutes = require("./routes/job-routes");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/auth/airtable", airtableAuthRoutes);
app.use('/api/scraper', authMiddleware, scraperRoutes);
app.use("/jobs", authMiddleware, jobRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Airtable API running at http://localhost:${process.env.PORT}`);
});
