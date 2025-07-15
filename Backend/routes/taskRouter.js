const express = require("express");
const {
  createTask,
  getAllTasks,
  getSingleTak,
  updateTask,
  deleteTask,
} = require("../controllers/taskController.js");
const { protect } = require("../middleware/authMiddleware.js");
const router = express.Router();

router.post("/create", protect, createTask);

router.get("/get-all", protect, getAllTasks);

router.get("/get-single/:taskId", protect, getSingleTak);

router.put("/update/:taskId", protect, updateTask);

router.delete("/delete/:taskId", protect, deleteTask);

module.exports = router;
