"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Calendar,
  Shield,
  Users,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
} from "lucide-react";
import Navbar from "@/app/components/Navbar/Navbar";
import { redirect } from "next/navigation";
import { getOrganizers } from "../services/organizerService";

const OrganisersPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  interface APIOrganizer {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
    country_code: string;
    is_email_verified: boolean;
    organizer_status: string;
    account_status: string;
    roles: {
      id: string;
      name: string;
      description: string;
    }[];
    created_at: string;
    updated_at: string;
  }

  interface APIResponse {
    success: boolean;
    message: string;
    data: {
      limit: number;
      organizers: APIOrganizer[];
    };
  }

  const [data, setData] = useState<APIResponse | null>(null);

  useEffect(() => {
    async function loadData() {
      const res = await getOrganizers();
      setData(res);
    }
    loadData();
  }, []);

  function getInitials(firstName: string, lastName: string) {
    const first = firstName?.[0] || "";
    const last = lastName?.[0] || "";
    return (first + last).toUpperCase();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 ml-64">
      <div>
        <Navbar
          title="Organisers"
          addMessage="Add New Organiser"
          handleOpen={() => {
            redirect("/organisers/createorganisers");
          }}
        />
      </div>

      {/* Organisers Grid */}
      <div className="px-6 py-6">
        {/* Search and Filter */}
        <div className=" border-b border-gray-200 pb-6 px-4">
          <div className="mt-4 flex items-center justify-between space-x-4">
            <div className="relative flex-1 max-w-md shadow-xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-xl">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-gray-700">Filter events</span>
            </button>
          </div>
        </div>

        {/* profile card  */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.data.organizers.map((organiser) => (
            <div
              key={organiser.id}
              className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Profile Section */}
              <div className="px-4 py-4">
                {/* Avatar */}
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-full border-4 border-white bg-gray-300 flex items-center justify-center text-white font-bold text-lg">
                    {getInitials(organiser.first_name, organiser.last_name)}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {organiser.first_name} {organiser.last_name}
                  </h3>
                </div>

                {/* Content */}
                <div className="pt-10">
                  {/* Roles */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {organiser.roles.map((role) => (
                      <span
                        key={role.id}
                        className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded"
                      >
                        {role.name}
                      </span>
                    ))}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {organiser.roles[0]?.description}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                    <div className="bg-gray-50 rounded-lg p-2">
                      <div className="flex items-center justify-center mb-1">
                        <Shield className="w-4 h-4 text-blue-500" />
                      </div>
                      <div className="text-sm font-semibold text-gray-900 capitalize">
                        {organiser.organizer_status}
                      </div>
                      <div className="text-xs text-gray-600">Status</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <div className="flex items-center justify-center mb-1">
                        <Calendar className="w-4 h-4 text-green-500" />
                      </div>
                      <div className="text-sm font-semibold text-gray-900 capitalize">
                        {organiser.account_status}
                      </div>
                      <div className="text-xs text-gray-600">Account</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <div className="flex items-center justify-center mb-1">
                        <Users className="w-4 h-4 text-purple-500" />
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {organiser.is_email_verified ? "Yes" : "No"}
                      </div>
                      <div className="text-xs text-gray-600">Verified</div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-1 mb-4">
                    <div className="flex items-center text-xs text-gray-600">
                      <Phone className="w-3 h-3 mr-2" />
                      <span>
                        {organiser.country_code} {organiser.phone}
                      </span>
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <Mail className="w-3 h-3 mr-2" />
                      <span className="truncate">{organiser.email}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                      View Profile
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </button>
                    <button className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                      View Events
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center space-x-4 mt-8">
          <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </button>

          <div className="flex space-x-1">
            {[1, 2, 3].map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  currentPage === page
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrganisersPage;
