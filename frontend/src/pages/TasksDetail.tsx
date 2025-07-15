"use client";
import React, { useState, useEffect } from "react";
import CreateNewTask from "../components/CreateNewTask";
import ConfirmationModal from "../components/ConfirmationModal";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "react-hot-toast";

interface Task {
  _id: string;
  title: string;
  description?: string;
  status: "pending" | "completed";
  createdAt: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const TasksDetail = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [activeTab, setActiveTab] = useState<"pending" | "completed">(
    "pending"
  );
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    action: "delete" | "status";
    id: string;
    title: string;
    newStatus?: "pending" | "completed";
  }>({
    isOpen: false,
    action: "delete",
    id: "",
    title: "",
    newStatus: undefined,
  });
  const [editTask, setEditTask] = useState<Task | null>(null);

  const fetchTasks = async (
    page: number = 1,
    status: "pending" | "completed" = activeTab
  ) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `/task/get-all?page=${page}&limit=10&status=${status}`
      );
      setTasks(response.data.tasks);
      setPagination(
        response.data.pagination || {
          page: response.data.page || page,
          limit: response.data.limit || 10,
          total: response.data.total || response.data.tasks.length,
          pages:
            response.data.pages ||
            Math.ceil(response.data.total / response.data.limit) ||
            1,
        }
      );
      setError(null);
    } catch (err) {
      setError("Failed to fetch tasks. Please try again later.");
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks(1, activeTab);
  }, [activeTab]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      fetchTasks(newPage, activeTab);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axiosInstance.delete(`/task/delete/${id}`);
      fetchTasks(pagination.page, activeTab);
      setConfirmationModal({
        isOpen: false,
        action: "delete",
        id: "",
        title: "",
        newStatus: undefined,
      });
      toast.success("Task deleted successfully!");
    } catch (err: any) {
      console.error("Error deleting task:", err);
      toast.error(err.response?.data?.message || "Failed to delete task");
    }
  };

  const handleStatusUpdate = async (
    id: string,
    newStatus: "pending" | "completed"
  ) => {
    try {
      await axiosInstance.put(`/task/update/${id}`, { status: newStatus });
      fetchTasks(pagination.page, activeTab);
      setConfirmationModal({
        isOpen: false,
        action: "status",
        id: "",
        title: "",
        newStatus: undefined,
      });
      toast.success(`Task marked as ${newStatus}!`);
    } catch (err: any) {
      console.error("Error updating task status:", err);
      toast.error(
        err.response?.data?.message || "Failed to update task status"
      );
    }
  };

  const openConfirmationModal = (
    action: "delete" | "status",
    id: string,
    title: string,
    newStatus?: "pending" | "completed"
  ) => {
    setConfirmationModal({
      isOpen: true,
      action,
      id,
      title,
      newStatus,
    });
  };

  const openTaskModal = (task?: Task) => {
    setEditTask(task || null);
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl">
        {/* Tab Navigation */}
        <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-6 py-3 rounded-lg text-base font-semibold transition-all duration-300 transform hover:scale-105 ${
                activeTab === "pending"
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                  : "bg-white/10 text-gray-300 hover:bg-white/20"
              }`}
            >
              Pending Tasks
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={`px-6 py-3 rounded-lg text-base font-semibold transition-all duration-300 transform hover:scale-105 ${
                activeTab === "completed"
                  ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg"
                  : "bg-white/10 text-gray-300 hover:bg-white/20"
              }`}
            >
              Completed Tasks
            </button>
          </div>
          <button
            onClick={() => openTaskModal()}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5 mr-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            Add Task
          </button>
        </div>

        {/* Loading and Error States */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          </div>
        )}

        {error && <div className="text-red-400 text-center py-8">{error}</div>}

        {/* Table Section with Scroll */}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-white/5">
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-400">
                    Title
                  </th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-400">
                    Description
                  </th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-400">
                    Created At
                  </th>
                  <th className="text-center py-3 px-6 text-sm font-medium text-gray-400">
                    Status
                  </th>
                  <th className="text-center py-3 px-6 text-sm font-medium text-gray-400 w-32">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {tasks?.map((task) => (
                  <tr
                    key={task._id}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="py-3 px-6 text-sm text-gray-300 whitespace-nowrap">
                      {task.title}
                    </td>
                    <td className="py-3 px-6 text-sm text-gray-300">
                      {task.description || "-"}
                    </td>
                    <td className="py-3 px-6 text-sm text-gray-300 whitespace-nowrap">
                      {new Date(task.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-6 text-center">
                      <span
                        className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${
                          task.status === "pending"
                            ? "text-yellow-400 bg-yellow-500/20"
                            : "text-green-400 bg-green-500/20"
                        }`}
                      >
                        {task.status.charAt(0).toUpperCase() +
                          task.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-center flex justify-center gap-2">
                      {activeTab !== "completed" && (
                        <>
                          <button
                            onClick={() => openTaskModal(task)}
                            className="inline-flex items-center justify-center w-8 h-8 text-blue-400 hover:text-white bg-transparent hover:bg-blue-500/20 rounded-lg transition-colors"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="w-5 h-5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() =>
                              openConfirmationModal(
                                "status",
                                task._id,
                                task.title,
                                task.status === "pending"
                                  ? "completed"
                                  : "pending"
                              )
                            }
                            className="inline-flex items-center justify-center w-8 h-8 text-green-400 hover:text-white bg-transparent hover:bg-green-500/20 rounded-lg transition-colors"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="w-5 h-5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4.5 12.75l6 6 9-13.5"
                              />
                            </svg>
                          </button>
                        </>
                      )}
                      <button
                        onClick={() =>
                          openConfirmationModal("delete", task._id, task.title)
                        }
                        className="inline-flex items-center justify-center w-8 h-8 text-red-400 hover:text-white bg-transparent hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && tasks?.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
            <div className="text-sm text-gray-400">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
              of {pagination.total} tasks
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 
                        ${
                          pagination.page === 1
                            ? "bg-white/5 text-gray-500 cursor-not-allowed"
                            : "bg-white/10 text-gray-300 hover:bg-white/20"
                        }`}
              >
                Previous
              </button>
              {Array.from({ length: pagination.pages }, (_, i) => i + 1)?.map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 
                          ${
                            pagination.page === page
                              ? "bg-blue-500/20 text-blue-400"
                              : "bg-white/10 text-gray-300 hover:bg-white/20"
                          }`}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 
                        ${
                          pagination.page === pagination.pages
                            ? "bg-white/5 text-gray-500 cursor-not-allowed"
                            : "bg-white/10 text-gray-300 hover:bg-white/20"
                        }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Task Modal */}
      {isModalOpen && (
        <CreateNewTask
          onClose={() => {
            setIsModalOpen(false);
            setEditTask(null);
            fetchTasks(pagination.page, activeTab);
          }}
          task={editTask}
        />
      )}

      {/* Confirmation Modal */}
      {confirmationModal.isOpen && (
        <ConfirmationModal
          isOpen={confirmationModal.isOpen}
          onClose={() =>
            setConfirmationModal({
              isOpen: false,
              action: "delete",
              id: "",
              title: "",
              newStatus: undefined,
            })
          }
          onConfirm={() =>
            confirmationModal.action === "delete"
              ? handleDelete(confirmationModal.id)
              : handleStatusUpdate(
                  confirmationModal.id,
                  confirmationModal.newStatus!
                )
          }
          action={confirmationModal.action}
          title={confirmationModal.title}
          newStatus={confirmationModal.newStatus}
        />
      )}
    </div>
  );
};

export default TasksDetail;
