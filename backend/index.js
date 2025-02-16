require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// MongoDB Connection
const mongoURI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/csh_awards";
mongoose.connect(mongoURI);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => console.log("Connected to MongoDB"));

// Mongoose Schema
const nominationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  organization: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  categories: { type: [String], required: true },
  submittedAt: { type: Date, default: Date.now },
});

const Nomination = mongoose.model("Nomination", nominationSchema);

// Endpoint to submit a nomination
app.post("/submit-nomination", async (req, res) => {
  try {
    const {
      title,
      firstName,
      lastName,
      organization,
      email,
      phone,
      address,
      categories,
    } = req.body;

    // Basic validation: ensure all required fields are provided
    if (
      !title ||
      !firstName ||
      !lastName ||
      !organization ||
      !email ||
      !phone ||
      !address
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const nomination = new Nomination({
      title,
      firstName,
      lastName,
      organization,
      email,
      phone,
      address,
      categories: Array.isArray(categories) ? categories : [],
    });

    await nomination.save();
    res
      .status(201)
      .json({ message: "Nomination submitted successfully", nomination });
  } catch (error) {
    console.error("Submission error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Endpoint to get all nominations (for admin or review purposes)
app.get("/nominations", async (req, res) => {
  try {
    const nominations = await Nomination.find().sort({ submittedAt: -1 });
    res.json(nominations);
  } catch (error) {
    console.error("Error fetching nominations:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
