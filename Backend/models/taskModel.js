const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    status: {
      type: String, // ✅ You missed this
      enum: ["pending", "completed"], // ✅ enum must be nested under type
      default: "pending",
    },
  },
  { timestamps: true }
);

taskSchema.index({ status: 1, createdAt: -1 });

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
