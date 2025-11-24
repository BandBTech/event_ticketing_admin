import { useState } from "react";
import { X, Mail, Phone, Calendar, CheckCircle, User } from "lucide-react";

export default function AdminProfilePopup() {
  const [isOpen, setIsOpen] = useState(false);

  const adminData = {
    id: "9c7eebd0-2191-4a20-92c6-1589c982b212",
    email: "admin@timroticket.com",
    first_name: "Admin",
    last_name: "User",
    phone: "",
    country_code: "",
    is_email_verified: true,
    created_at: "2025-11-20T16:00:59.004525Z",
    updated_at: "2025-11-20T16:00:59.004525Z",
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  console.log("isOpen", isOpen);
  

  return (
      <div className="fixed inset-0 bg-gray/50 backdrop-blur-md shadow-2xl flex items-center justify-center p-4 z-50 animate-fadeIn">
        {/* Modal Content */}
        <div className="bg-gray-50 rounded border border-gray-300 max-w-md w-full overflow-hidden animate-slideUp">
          {/* Header */}
          <div className="bg-white border-b border-gray-300 p-6 relative">
            <button
              aria-label="Close Modal"
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 rounded p-1 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-100 border border-gray-300 rounded-full flex items-center justify-center">
                <User size={28} className="text-gray-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {adminData.first_name} {adminData.last_name}
                </h2>
                <p className="text-gray-500 text-sm">Administrator</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Email */}
            <div className="flex items-start space-x-3">
              <Mail className="text-gray-500 mt-1 flex-shrink-0" size={18} />
              <div className="flex-1">
                <p className="text-sm text-gray-500 font-medium">
                  Email Address
                </p>
                <div className="flex items-center space-x-2">
                  <p className="text-gray-900">{adminData.email}</p>
                  {adminData.is_email_verified && (
                    <CheckCircle className="text-gray-600" size={14} />
                  )}
                </div>
                {adminData.is_email_verified && (
                  <p className="text-xs text-gray-500 mt-1">Verified</p>
                )}
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start space-x-3">
              <Phone className="text-gray-500 mt-1 flex-shrink-0" size={18} />
              <div className="flex-1">
                <p className="text-sm text-gray-500 font-medium">
                  Phone Number
                </p>
                <p className="text-gray-900">
                  {adminData.phone || "Not provided"}
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 my-4"></div>

            {/* Created At */}
            <div className="flex items-start space-x-3">
              <Calendar
                className="text-gray-500 mt-1 flex-shrink-0"
                size={18}
              />
              <div className="flex-1">
                <p className="text-sm text-gray-500 font-medium">
                  Account Created
                </p>
                <p className="text-gray-900 text-sm">
                  {formatDate(adminData.created_at)}
                </p>
              </div>
            </div>

            {/* Updated At */}
            <div className="flex items-start space-x-3">
              <Calendar
                className="text-gray-500 mt-1 flex-shrink-0"
                size={18}
              />
              <div className="flex-1">
                <p className="text-sm text-gray-500 font-medium">
                  Last Updated
                </p>
                <p className="text-gray-900 text-sm">
                  {formatDate(adminData.updated_at)}
                </p>
              </div>
            </div>

            {/* User ID */}
            <div className="bg-gray-50 border border-gray-200 rounded p-3 mt-4">
              <p className="text-xs text-gray-500 font-medium mb-1">User ID</p>
              <p className="text-xs text-gray-700 font-mono break-all">
                {adminData.id}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 border-t border-gray-300 px-6 py-4 flex justify-end space-x-3">
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-gray-700 hover:bg-gray-200 border border-gray-300 rounded transition-colors font-medium"
            >
              Close
            </button>
            <button className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 transition-colors font-medium">
              Edit Profile
            </button>
          </div>
        </div>
      </div>
  );
}
