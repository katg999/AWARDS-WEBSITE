const mongoose = require("mongoose");

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

module.exports = mongoose.model("Nomination", nominationSchema);
