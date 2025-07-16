const Task = require("../models/taskModel");
const mongoose = require("mongoose");

exports.createTask = async (req, res) => {
  try {
    const userId = req.user._id;
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required",
      });
    }

    const task = await Task.create({
      user: userId,
      title: title.trim(),
      description: description.trim(),
    });

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    console.log("Error creating task", error);
    res.status(500).json({
      success: false,
      message: "Failed to create task",
      error: error.message,
    });
  }
};

// exports.getAllTasks = async (req, res) => {
//   try {
//     const status = req.query.status || "pending";
//     const userId = req.user._id;

//     const tasks = await Task.aggregate([
//       { $match: { status } },
//       { $sort: { createdAt: -1 } },
//       {
//         $project: {
//           title: 1,
//           description: 1,
//           status: 1,
//           createdAt: 1,
//           updatedAt: 1,
//         },
//       },
//     ]);

//     res.status(200).json({
//       success: true,
//       message: "Tasks fetched successfully",
//       tasks,
//     });
//   } catch (error) {
//     console.log("Error getting all tasks", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to get all tasks",
//       error: error.message,
//     });
//   }
// };

exports.getAllTasks = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, page = 1, limit = 10 } = req.query;

    // Convert to numbers
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Build match filter
    const matchStage = {
      user: new mongoose.Types.ObjectId(userId),
    };

    if (status) {
      matchStage.status = status; // "pending" or "completed"
    }

    // Aggregation pipeline
    const tasks = await Task.aggregate([
      { $match: matchStage },
      { $sort: { createdAt: -1 } },
      {
        $project: {
          title: 1,
          description: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
      { $skip: skip },
      { $limit: limitNum },
    ]);

    // Optional: count total for frontend pagination
    const totalCount = await Task.countDocuments(matchStage);

    res.status(200).json({
      success: true,
      page: parseInt(page),
      totalPages: Math.ceil(totalCount / limitNum),
      totalTasks: totalCount,
      data: tasks,
    });
  } catch (error) {
    console.error("Error fetching tasks:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tasks",
      error: error.message,
    });
  }
};

exports.getSingleTak = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(taskId) } },
      {
        $project: {
          title: 1,
          description: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);
    res.status(200).json({
      success: true,
      data: task[0] || null,
    });
  } catch (error) {
    console.log("Error getting single task");
    res.status(500).json({
      success: false,
      message: "Failed to get task",
      error: error.message,
    });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    const updateFields = {};
    if (title?.trim()) updateFields.title = title.trim();
    if (description?.trim()) updateFields.description = description.trim();
    if (status) {
      const validStatuses = ["pending", "completed"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status. Must be 'pending' or 'completed'.",
        });
      }
      updateFields.status = status;
    }

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update",
      });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: updatedTask,
    });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update task",
      error: error.message,
    });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    const deletedTask = await Task.findByIdAndDelete(taskId);

    if (!deletedTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
      data: deletedTask,
    });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete task",
      error: error.message,
    });
  }
};
