const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    department: {
      type: Number,
      ref: "Department",
      required: true,
    },
    sectorId: {
      type: Number,
      required: true,
    },
    building: {
      type: String,
      enum: ["A", "B"],
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      default: "",
    },
    visitor: {
      type: String,
      default: "Anonymous",
    },
    visitorEmail: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "published", "resolved"],
      default: "pending",
    },
    response: {
      type: String,
      default: "",
    },
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
    respondedAt: {
      type: Date,
      default: null,
    },
    resolved: {
      type: Boolean,
      default: false,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    date: {
      type: String,
      default: "",
    },
    time: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Feedback", feedbackSchema);
