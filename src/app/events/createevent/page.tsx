"use client";

import React, { useState } from 'react';
import { ChevronDown, Upload, MapPin, Plus } from 'lucide-react';
import Navbar from '@/app/components/Navbar/Navbar';

const EventForm: React.FC = () => {
  const [eventDetailsOpen, setEventDetailsOpen] = useState(true);
  const [venueScheduleOpen, setVenueScheduleOpen] = useState(true);
  const [ticketingOpen, setTicketingOpen] = useState(true);
  const [discountsOpen, setDiscountsOpen] = useState(true);


  return (
    <div className=" mx-auto bg-white ml-64">
        {/* header  */}
        <div>
            <Navbar title="Create Event" addMessage='' handleOpen={() => {}}/>
        </div>
      {/* Event Details Section */}
      <div className="border border-gray-200 rounded-lg mb-4">
        <div 
          className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer border-b border-gray-200"
          onClick={() => setEventDetailsOpen(!eventDetailsOpen)}
        >
          <h2 className="text-sm font-medium text-gray-700">Event details</h2>
          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${eventDetailsOpen ? 'rotate-180' : ''}`} />
        </div>
        
        {eventDetailsOpen && (
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Banner Image */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Banner image</label>
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-500 mb-1">Upload banner image or drag and drop</p>
                  <p className="text-xs text-gray-400">PNG, JPG file of 1920x1080px size up to 5MB</p>
                  <button className="mt-2 text-xs text-blue-600 hover:text-blue-700">Browse file</button>
                </div>
              </div>
              
              {/* Event Title */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Event title</label>
                <input
                  type="text"
                  placeholder="Enter title for the event"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {/* Category Tags */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Category Tags</label>
                <input
                  type="text"
                  placeholder="e.g. Music, Concert, Festival"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            {/* Event Description */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Event description</label>
              <textarea
                placeholder="Tell what makes your event special"
                rows={4}
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Venue & Schedule Section */}
      <div className="border border-gray-200 rounded-lg mb-4">
        <div 
          className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer border-b border-gray-200"
          onClick={() => setVenueScheduleOpen(!venueScheduleOpen)}
        >
          <h2 className="text-sm font-medium text-gray-700">Venue & Schedule</h2>
          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${venueScheduleOpen ? 'rotate-180' : ''}`} />
        </div>
        
        {venueScheduleOpen && (
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Venue Name */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Venue name</label>
                <input
                  type="text"
                  placeholder="Enter name of venue"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {/* Venue Address */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Venue address</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter venue location"
                    className="w-full px-3 py-2 pr-8 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <MapPin className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
                </div>
              </div>
              
              {/* Capacity */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Capacity <span className="text-gray-400">(optional)</span></label>
                <input
                  type="text"
                  placeholder="e.g. 5000"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Timezone */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Timezone</label>
                <div className="relative">
                  <select 
                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                    aria-label="Select timezone"
                    title="Select timezone"
                  >
                    <option>Asia/Kathmandu</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-2.5 pointer-events-none" />
                </div>
              </div>
              
              {/* Start Date & Time */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Start date & time</label>
                <input
                  type="text"
                  placeholder="MM/DD/YYYY HH:mm aa"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {/* End Date & Time */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">End date & time</label>
                <input
                  type="text"
                  placeholder="MM/DD/YYYY HH:mm aa"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Ticketing Section */}
      <div className="border border-gray-200 rounded-lg mb-4">
        <div 
          className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer border-b border-gray-200"
          onClick={() => setTicketingOpen(!ticketingOpen)}
        >
          <h2 className="text-sm font-medium text-gray-700">Ticketing</h2>
          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${ticketingOpen ? 'rotate-180' : ''}`} />
        </div>
        
        {ticketingOpen && (
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Tier Name */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Tier Name</label>
                <input
                  type="text"
                  placeholder="Enter name of venue"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {/* Price */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Price</label>
                <div className="flex">
                  <div className="relative">
                    <select 
                      className="px-3 py-2 border border-r-0 border-gray-200 rounded-l-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white pr-8"
                      aria-label="Select currency"
                      title="Select currency"
                    >
                      <option>NPR</option>
                    </select>
                    <ChevronDown className="w-3 h-3 text-gray-400 absolute right-2 top-3 pointer-events-none" />
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. 100"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-r-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              {/* Quantity */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Quantity</label>
                <input
                  type="text"
                  placeholder="e.g. 100"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* GST */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">GST(%)</label>
                <input
                  type="text"
                  placeholder="Enter GST in percentage"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {/* Sales Start */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Sales start</label>
                <input
                  type="text"
                  placeholder="MM/DD/YYYY HH:mm aa"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {/* Sales End */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Sales ends</label>
                <input
                  type="text"
                  placeholder="MM/DD/YYYY HH:mm aa"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            {/* Add Ticket Tier Button */}
            <button className="flex items-center gap-2 text-blue-600 text-sm hover:text-blue-700">
              <Plus className="w-4 h-4" />
              Add ticket tier
            </button>
          </div>
        )}
      </div>

      {/* Discounts & Promo Codes Section */}
      <div className="border border-gray-200 rounded-lg mb-6">
        <div 
          className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer"
          onClick={() => setDiscountsOpen(!discountsOpen)}
        >
          <h2 className="text-sm font-medium text-gray-700">Discounts & Promo Codes</h2>
          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${discountsOpen ? 'rotate-180' : ''}`} />
        </div>
        
        {discountsOpen && (
          <div className="p-4">
            <button className="flex items-center gap-2 text-blue-600 text-sm hover:text-blue-700">
              <Plus className="w-4 h-4" />
              Add promo code
            </button>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <button className="px-6 py-2 text-gray-600 hover:text-gray-700 text-sm">
          Cancel
        </button>
        <div className="flex gap-3">
          <button className="px-6 py-2 border border-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-50">
            Save as draft
          </button>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
            Create Event
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventForm;