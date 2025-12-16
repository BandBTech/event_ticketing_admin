"use client";

import { Button } from "@/components/ui/button";

import { adminService } from "@/lib/adminService";
import { useState } from "react";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";

export default function PermissionSettingsPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleInitializeSystem = async () => {
    setIsLoading(true);
    try {
      const response = await adminService.initializeSystemPermissions();
      toast.success(response.message || "System permissions initialized successfully");
    } catch (error) {
      // toast handled by api client/service usually, but safety net here
      console.error("Failed to initialize system permissions", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-poppins">Permission Settings</h1>
        {/* <p className="text-sm text-gray-600 mt-1">
          Manage system-level permissions and configurations.
        </p> */}
      </div>

      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center justify-between bg-gray-50/50 p-4 rounded-lg border border-gray-100">
          <div className="space-y-1">
            <h4 className="text-sm font-medium text-gray-900">Initialize Permissions</h4>
            {/* <p className="text-sm text-gray-500">
              This will re-sync all default permissions and roles.
            </p> */}
          </div>
          <Button
            onClick={handleInitializeSystem}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? "Initializing..." : "Initialize System"}
          </Button>
        </div>
      </div>
    </div>
  );
}
