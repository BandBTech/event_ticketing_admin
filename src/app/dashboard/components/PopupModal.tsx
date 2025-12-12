import React, { useState } from "react";
import { X } from "lucide-react"; // If you don't have lucide-react, I'll provide an alternative

interface PopupModalProps {
  title: string;
  children?: React.ReactNode;
  isApprove?: boolean;
  onCancel?: () => void;
  onConfirm?: (data: { commissionRate?: number; adminRemark: string }) => void;
  showCommissionInput?: boolean;
}

const PopupModal = ({
  title,
  children,
  isApprove,
  onCancel,
  onConfirm,
  showCommissionInput = false,
}: PopupModalProps) => {
  const [commissionRate, setCommissionRate] = useState<string>("10");
  const [adminRemark, setAdminRemark] = useState("");
  const [commissionError, setCommissionError] = useState("");

  const handleConfirm = () => {
    // Validate commission rate for approval
    if (showCommissionInput) {
      const rate = parseFloat(commissionRate);
      if (!commissionRate || isNaN(rate) || rate < 0 || rate > 100) {
        setCommissionError("Commission rate must be between 0 and 100");
        return;
      }
      setCommissionError("");
    }

    onConfirm?.({
      commissionRate:
        showCommissionInput && commissionRate
          ? parseFloat(commissionRate)
          : undefined,
      adminRemark,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 group"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {children}

          {showCommissionInput && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Commission Rate
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${commissionError ? 'border-red-500' : 'border-gray-200'
                  }`}
                placeholder="10%"
                value={commissionRate}
                onChange={(e) => {
                  setCommissionRate(e.target.value);
                  setCommissionError("");
                }}
              />
              {commissionError ? (
                <p className="text-xs text-red-500">{commissionError}</p>
              ) : (
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 bg-gray-400 rounded-full" />
                    Commission rate is always in percentage
                  </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {isApprove
                ? "Additional Notes (Optional)"
                : "Reason for Rejection"}
            </label>
            <textarea
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
              placeholder={
                isApprove
                  ? "Add any additional notes..."
                  : "Please provide a reason for rejection..."
              }
              value={adminRemark}
              onChange={(e) => setAdminRemark(e.target.value)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-lg font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            Cancel
          </button>
          {isApprove ? (
            <button
              onClick={handleConfirm}
              className="px-5 py-2.5 rounded-lg font-medium text-white bg-green-600 hover:bg-green-700 shadow-sm hover:shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Accept
            </button>
          ) : (
            <button
              onClick={handleConfirm}
              className="px-5 py-2.5 rounded-lg font-medium text-white bg-red-600 hover:bg-red-700 shadow-sm hover:shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Reject
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PopupModal;
