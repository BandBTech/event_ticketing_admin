import { useState } from "react";
import {
  X,
  Mail,
  Phone,
  CheckCircle,
  User,
  Save,
} from "lucide-react";
import { authService } from "@/lib/authService";
import { toast } from "sonner";

interface AdminData {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  country_code: string;
  is_email_verified: boolean;
  created_at: string;
  updated_at: string;
}
interface AdminProfileModalProps {
  setShowAdminProfile: (show: boolean) => void;
  profileData: AdminData | null;
}

export default function AdminProfileModal({
  setShowAdminProfile,
  profileData,
}: AdminProfileModalProps) {

  const emptyAdmin: AdminData = {
    id: "",
    email: "",
    first_name: "",
    last_name: "",
    phone: "",
    country_code: "",
    is_email_verified: false,
    created_at: "",
    updated_at: "",
  };

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const initialData: AdminData = profileData ?? emptyAdmin;

  const [adminData, setAdminData] = useState<AdminData>(initialData);
  const [editedData, setEditedData] = useState<AdminData>(initialData);

  if (!profileData) return null;

  const handleInputChange = (field: keyof AdminData, value: string) => {
    setEditedData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      await authService.updateProfile(editedData);

      setAdminData({
        ...editedData,
        updated_at: new Date().toISOString(),
      });
      toast.success("Profile updated successfully!");

      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedData(adminData);
    setIsEditing(false);
  };

  const handleEditClick = () => {
    setEditedData(adminData);
    setIsEditing(true);
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 bg-gray/50 backdrop-blur-md shadow-2xl flex items-center justify-center p-4 z-50 animate-fadeIn">
      {/* Modal Content */}
      <div className="bg-gray-50 rounded border border-gray-300 max-w-md w-full overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="bg-white border-b border-gray-300 p-6 relative">
          <button
            aria-label="Close Modal"
            onClick={() => setShowAdminProfile(false)}
            className="absolute top-2 right-4 text-gray-400 hover:text-gray-600 rounded p-1 transition-colors"
          >
            <X size={20} />
          </button>

          <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Profile</h1>

          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-100 border border-gray-300 rounded-full flex items-center justify-center">
              <User size={28} className="text-gray-600" />
            </div>
            <div>
              {isEditing ? (
                <div className="max-w-md space-y-2">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={editedData.first_name}
                      onChange={(e) =>
                        handleInputChange("first_name", e.target.value)
                      }
                      className="text-lg w-1/2 font-semibold text-gray-900 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-gray-400"
                      placeholder="First Name"
                    />
                    <input
                      type="text"
                      value={editedData.last_name}
                      onChange={(e) =>
                        handleInputChange("last_name", e.target.value)
                      }
                      className="text-lg w-1/2 font-semibold text-gray-900 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-gray-400"
                      placeholder="Last Name"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {adminData.first_name} {adminData.last_name}
                  </h2>
                  <p className="text-gray-500 text-sm">Administrator</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 mt-4">
          {/* Email */}
          <div className="flex items-start space-x-3">
            <Mail className="text-gray-500 mt-1 flex-shrink-0" size={18} />
            <div className="flex-1">
              <p className="text-sm text-gray-500 font-medium">Email Address</p>
                <div className="flex items-center space-x-2">
                  <p className="text-gray-900">{adminData.email}</p>
                  {adminData.is_email_verified && (
                    <CheckCircle className="text-gray-600" size={14} />
                  )}
                </div>
              {adminData.is_email_verified && !isEditing && (
                <p className="text-xs text-gray-500 mt-1">Verified</p>
              )}
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-start space-x-3">
            <Phone className="text-gray-500 mt-1 flex-shrink-0" size={18} />
            <div className="flex-1">
              <p className="text-sm text-gray-500 font-medium">Phone Number</p>
              {isEditing ? (
                <div className="flex space-x-2 mt-1">
                  <input
                    type="text"
                    value={editedData.country_code}
                    onChange={(e) =>
                      handleInputChange("country_code", e.target.value)
                    }
                    className="w-20 text-gray-900 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
                    placeholder="+1"
                  />
                  <input
                    type="tel"
                    value={editedData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="flex-1 text-gray-900 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
                    placeholder="Phone number"
                  />
                </div>
              ) : (
                <p className="text-gray-900">
                  {adminData.country_code && adminData.phone
                    ? `${adminData.country_code} ${adminData.phone}`
                    : adminData.phone || "Not provided"}
                </p>
              )}
            </div>
          </div>      
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-300 px-6 py-4 flex justify-end space-x-3">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 border border-gray-300 rounded transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 transition-colors font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setShowAdminProfile(false);
                  handleReload();
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 border border-gray-300 rounded transition-colors font-medium"
              >
                Close
              </button>
              <button
                onClick={handleEditClick}
                className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 transition-colors font-medium"
              >
                Edit Profile
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}