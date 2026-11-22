
import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    source: {
      type: String,
      enum: ["website", "facebook", "linkedin", "referral", "other"],
      default: "website",
    },

    budget: {
      type: Number,
      min: 0,
    },

    location: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ["new", "contacted", "qualified", "negotiation", "converted", "lost"],
      default: "new",
    },

    leadScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    priority: {
      type: String,
      enum: ["hot", "warm", "cold"],
      default: "cold",
    },

    aiAnalysis: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Lead = mongoose.model("Lead", leadSchema);

export default Lead;
