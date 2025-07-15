"use client";
import React from "react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  action: "delete" | "status";
  title: string;
  newStatus?: "pending" | "completed";
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  action,
  title,
  newStatus,
}) => {
  if (!isOpen) return null;

  const isDelete = action === "delete";
  const modalTitle = isDelete ? "Confirm Delete" : "Confirm Status Change";
  const message = isDelete
    ? `Are you sure you want to delete task "${title}"? This action cannot be undone.`
    : `Are you sure you want to mark task "${title}" as ${newStatus}?`;
  const confirmButtonStyle = isDelete
    ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
    : "bg-green-500/20 text-green-400 hover:bg-green-500/30";
  const confirmButtonText = isDelete ? "Delete" : "Confirm";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 w-full max-w-sm mx-4 border border-white/10 shadow-xl">
        <div className="text-center">
          <div
            className={`w-12 h-12 rounded-full ${
              isDelete ? "bg-red-500/20" : "bg-green-500/20"
            } mx-auto mb-4 flex items-center justify-center`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={`w-6 h-6 ${
                isDelete ? "text-red-400" : "text-green-400"
              }`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d={
                  isDelete
                    ? "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                    : "M4.5 12.75l6 6 9-13.5"
                }
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            {modalTitle}
          </h3>
          <p className="text-gray-400 mb-6">{message}</p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-white/10 text-gray-300 rounded-lg hover:bg-white/5 transition-colors duration-200 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-2 ${confirmButtonStyle} rounded-lg transition-colors duration-200 text-sm font-medium`}
            >
              {confirmButtonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
