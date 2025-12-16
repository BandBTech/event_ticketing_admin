"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  Upload,
  MapPin,
  ChevronLeft,
  Save,
  Calendar,
  DollarSign,
  Ticket,
  Image as ImageIcon,
  Type
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";

const EventForm: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get("edit") === "true";

  const handleCreateEvent = () => {
    toast.success(isEditMode ? "Event updated successfully" : "Event created successfully");
    router.push("/events");
  };

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {isEditMode ? "Edit Event" : "Create New Event"}
                </h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  {isEditMode ? "Update event details and settings" : "Fill in the details to publish your event"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateEvent}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Save className="w-4 h-4" />
                {isEditMode ? "Save Changes" : "Create Event"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1 space-y-6">

            {/* Basic Details Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="border-b border-gray-100 px-6 py-4 bg-gray-50/50 flex items-center gap-2">
                <Type className="w-4 h-4 text-blue-500" />
                <h2 className="text-sm font-semibold text-gray-900">Basic Details</h2>
              </div>

              <div className="p-6 space-y-6">
                {/* Banner Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Banner Image
                  </label>
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-blue-300 hover:bg-blue-50/50 transition-colors cursor-pointer group">
                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-100 transition-colors">
                      <ImageIcon className="w-6 h-6 text-blue-500" />
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG up to 5MB (1920x1080px recommended)
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Event Title */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                      Event Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Summer Music Festival 2024"
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                    />
                  </div>

                  {/* Category Tags */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                      Categories
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Music, Tech, Conference (comma separated)"
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                    />
                  </div>
                </div>

                {/* Event Description */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                    Description
                  </label>
                  <textarea
                    placeholder="Describe your event..."
                    rows={6}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y transition-shadow"
                  />
                </div>
              </div>
            </div>

            {/* Venue & Time Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="border-b border-gray-100 px-6 py-4 bg-gray-50/50 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-orange-500" />
                <h2 className="text-sm font-semibold text-gray-900">Time & Location</h2>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Venue Name */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                      Venue Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Kathmandu Convention Center"
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                    />
                  </div>
                  {/* Address */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                      Address
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Full address"
                        className="w-full pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                      />
                      <MapPin className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
                    </div>
                  </div>

                  {/* Start Date */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                      Start Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                    />
                  </div>

                  {/* End Date */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                      End Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Ticketing Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="border-b border-gray-100 px-6 py-4 bg-gray-50/50 flex items-center gap-2">
                <Ticket className="w-4 h-4 text-emerald-500" />
                <h2 className="text-sm font-semibold text-gray-900">Ticketing</h2>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                      Ticket Tier Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. General Admission"
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                      Quantity
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 500"
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                      Price (NPR)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="0.00"
                        className="w-full pl-8 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                      />
                      <div className="absolute left-3 top-2.5 text-gray-400">
                        <span className="text-sm font-semibold">Rs</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Sidebar (Optional settings) */}
          <div className="w-80 space-y-6 hidden lg:block">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Visibility</h3>
              </div>
              <div className="p-5 space-y-4">
                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input type="radio" name="visibility" className="w-4 h-4 text-blue-600" defaultChecked />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Public</p>
                    <p className="text-xs text-gray-500">Visible to everyone</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input type="radio" name="visibility" className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Draft</p>
                    <p className="text-xs text-gray-500">Only visible to you</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Settings</h3>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Display remaining tickets</span>
                  <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Allow refunds</span>
                  <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventForm;
