const mongoose = require("mongoose");

const incidentSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: [true, "User is required"],
  },
  title: {
    required: true,
    type: String,
    trim: true,
  },
  type: {
    type: String, // Incident type
    required: true,
  },
  description: {
    required: true,
    type: String,
    trim: true,
  },
  date: {
    type: Date, // Incident date
    required: true,
    default: Date.now,
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
  state: {
    type: String,
    required: true,
  },
  district: {
    type: String,
    required: true,
  },
  locality: {
    type: String,
    required: true,
  },
  reporterName: {
    type: String, // Reporter's name
    required: true,
  },
  phoneNumber: {
    type: String, // Reporter's phone number
    required: true,
  },
  verifiedStatus: {
    type: String, // Verification status
    enum: ["Verified", "Unverified"],
    default: "Unverified",
  },
  fileUrl: {
    type: String, // Stores file URL from Firebase Storage
    default: "",  // Empty string if no file is uploaded
  },
});

const incidentModel = mongoose.model("incident", incidentSchema);
module.exports = incidentModel;
