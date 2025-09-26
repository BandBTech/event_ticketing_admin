'use client';

import React from 'react';
import { Globe, ChevronDown, Calendar, Clock, Users } from 'lucide-react';
import Navbar from '../components/Navbar/Navbar';

const AdminDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 ml-64">
      {/* Header */}
      <div className="">
          <Navbar title="Admin Dashboard" addMessage=''/>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Successful Events Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100/50">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="text-3xl font-bold text-gray-900 mb-1">24</div>
                <div className="text-sm text-gray-600 font-medium">Successful Events</div>
              </div>
            </div>
          </div>

          {/* Pending Approval Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100/50">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="flex-1">
                <div className="text-3xl font-bold text-gray-900 mb-1">11</div>
                <div className="text-sm text-gray-600 font-medium">Pending approval</div>
              </div>
            </div>
          </div>

          {/* Organizers Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100/50">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="text-3xl font-bold text-gray-900 mb-1">8</div>
                <div className="text-sm text-gray-600 font-medium">Organizers</div>
              </div>
            </div>
          </div>
        </div>

        {/* Events Awaiting Approval Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              Events awaiting approval
            </h2>
          </div>
          
          {/* Empty State */}
          <div className="h-64 flex items-center justify-center">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <Calendar className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">No events awaiting approval</p>
              <p className="text-sm text-gray-400">
                When organizers submit events for review, they'll appear here
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;