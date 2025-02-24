// netlify/functions/api.js

const express = require("express");
const serverless = require("serverless-http");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

// Load environment variables
require("dotenv").config();

// Initialize Express app
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// MongoDB Connection
const mongoURI =
  process.env.MONGODB_URI ||
  "mongodb+srv://katendek64:B9UwNajzpPwBao3h@clusterawards.3yxlv.mongodb.net/?retryWrites=true&w=majority&appName=ClusterAwards";
mongoose.connect(mongoURI);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => console.log("Connected to MongoDB"));

// Mongoose Schema
const nominationSchema = new mongoose.Schema({
  // Nominator Details
  nominatorTitle: { type: String, default: "" }, // Optional field
  nominatorFirstName: { type: String, required: true },
  nominatorLastName: { type: String, required: true },
  nominatorEmail: { type: String, required: true },
  nominatorPhone: { type: String, required: true },
  nominatorOrganization: { type: String, required: true },

  // Nominee Details
  nomineeTitle: { type: String, default: "" }, // Optional field
  nomineeFirstName: { type: String, required: true },
  nomineeLastName: { type: String, required: true },
  nomineeEmail: { type: String, required: true },
  nomineePhone: { type: String, required: true },
  nomineeOrganization: { type: String, required: true },
  nomineeAddress: { type: String, required: true },

  // Categories
  categories: { type: [String], required: true },

  // Timestamp
  submittedAt: { type: Date, default: Date.now },
});

const Nomination = mongoose.model("Nomination", nominationSchema);

// Routes
const router = express.Router();

// Endpoint to submit a nomination
router.post("/submit-nomination", async (req, res) => {
  try {
    const {
      // Nominator Details
      nominatorTitle,
      nominatorFirstName,
      nominatorLastName,
      nominatorEmail,
      nominatorPhone,
      nominatorOrganization,

      // Nominee Details
      nomineeTitle,
      nomineeFirstName,
      nomineeLastName,
      nomineeEmail,
      nomineePhone,
      nomineeOrganization,
      nomineeAddress,

      // Categories
      categories,
    } = req.body;

    // Parse categories from JSON string (if sent as a string)
    const parsedCategories = JSON.parse(categories || "[]");

    const nomination = new Nomination({
      // Nominator Details
      nominatorTitle: nominatorTitle || "", // Default to empty string if not provided
      nominatorFirstName,
      nominatorLastName,
      nominatorEmail,
      nominatorPhone,
      nominatorOrganization,

      // Nominee Details
      nomineeTitle: nomineeTitle || "", // Default to empty string if not provided
      nomineeFirstName,
      nomineeLastName,
      nomineeEmail,
      nomineePhone,
      nomineeOrganization,
      nomineeAddress,

      // Categories
      categories: Array.isArray(parsedCategories) ? parsedCategories : [],
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
router.get("/nominations", async (req, res) => {
  try {
    const nominations = await Nomination.find().sort({ submittedAt: -1 });
    res.json(nominations);
  } catch (error) {
    console.error("Error fetching nominations:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Use the router
app.use("/.netlify/functions/api", router); // Base path for Netlify Functions

// Export the handler
module.exports.handler = serverless(app);
