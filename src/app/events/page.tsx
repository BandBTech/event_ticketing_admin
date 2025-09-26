"use client";

import React, { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  Calendar,
  MapPin,
  ArrowRight,
  Edit,
  ChevronLeft,
  ChevronRight,
  Globe,
} from "lucide-react";
import Navbar from "../components/Navbar/Navbar";

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  tags: string[];
  status: "ON SALE" | "SALE ON HOLD" | null;
  gradient: string;
}

const EventsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const events: Event[] = [
    {
      id: 1,
      title: "Kathmandu Music Festival 2025",
      date: "2025-08-12",
      time: "09:00 AM",
      location: "Kathmandu, Nepal",
      tags: ["Music", "Concert", "Festival"],
      status: "ON SALE",
      gradient: "bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800",
    },
    {
      id: 2,
      title: "Kathmandu Music Festival 2025",
      date: "2025-08-12",
      time: "09:00 AM",
      location: "Kathmandu, Nepal",
      tags: ["Music", "Concert", "Festival"],
      status: "SALE ON HOLD",
      gradient: "bg-gradient-to-br from-purple-600 via-pink-600 to-purple-800",
    },
    {
      id: 3,
      title: "Kathmandu Music Festival 2025",
      date: "2025-08-12",
      time: "09:00 AM",
      location: "Kathmandu, Nepal",
      tags: ["Music", "Concert", "Festival"],
      status: null,
      gradient: "bg-gradient-to-br from-blue-500 via-indigo-600 to-blue-800",
    },
    {
      id: 4,
      title: "Kathmandu Music Festival 2025",
      date: "2025-08-12",
      time: "09:00 AM",
      location: "Kathmandu, Nepal",
      tags: ["Music", "Concert", "Festival"],
      status: null,
      gradient:
        "bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800",
    },
    {
      id: 5,
      title: "Kathmandu Music Festival 2025",
      date: "2025-08-12",
      time: "09:00 AM",
      location: "Kathmandu, Nepal",
      tags: ["Music", "Concert", "Festival"],
      status: null,
      gradient: "bg-gradient-to-br from-red-600 via-pink-600 to-purple-700",
    },
    {
      id: 6,
      title: "Kathmandu Music Festival 2025",
      date: "2025-08-12",
      time: "09:00 AM",
      location: "Kathmandu, Nepal",
      tags: ["Music", "Concert", "Festival"],
      status: null,
      gradient: "bg-gradient-to-br from-green-500 via-lime-600 to-green-700",
    },
  ];

  const handleCreateEvent = () => {
    console.log("Create new event");
  };

  const handleViewDetail = (eventId: number) => {
    console.log(`View detail for event ${eventId}`);
  };

  const handleEditEvent = (eventId: number) => {
    console.log(`Edit event ${eventId}`);
  };

  return (
    <div className="flex-1 bg-gray-50 min-h-screen ml-64">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <Navbar title="Events" addMessage="Create Event" />

        {/* Search and Filter */}
        <div className="mt-4 flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-gray-700">Filter events</span>
          </button>
        </div>
      </div>

      {/* Events Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* Event Image with Gradient */}
              <div className={`h-40 ${event.gradient} relative`}>
                {event.status && (
                  <div className="absolute top-3 left-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        event.status === "ON SALE"
                          ? "bg-green-500 text-white"
                          : "bg-orange-500 text-white"
                      }`}
                    >
                      {event.status}
                    </span>
                  </div>
                )}
              </div>

              {/* Event Content */}
              <div className="p-4">
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {event.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Event Title */}
                <h3 className="font-semibold text-gray-900 mb-3">
                  {event.title}
                </h3>

                {/* Event Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>
                      {event.date} {event.time}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{event.location}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => handleViewDetail(event.id)}
                    className="flex items-center text-sm text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <span>View Detail</span>
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </button>

                  <button
                    aria-label="Edit Event"
                    onClick={() => handleEditEvent(event.id)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center mt-8 space-x-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            className="flex items-center px-3 py-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            <span>Previous</span>
          </button>

          <div className="flex space-x-1">
            {[1, 2, 3].map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 rounded-md text-sm ${
                  currentPage === page
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                } transition-colors`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            className="flex items-center px-3 py-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <span>Next</span>
            <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventsPage;
