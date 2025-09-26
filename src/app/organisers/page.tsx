'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  Users, 
  Star,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Globe,
  Phone,
  Mail
} from 'lucide-react';
import Navbar from '@/app/components/Navbar/Navbar';

const OrganisersPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Sample organizer data
  const organisers = [
    {
      id: 1,
      name: 'Event Masters Nepal',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop',
      coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=300&fit=crop',
      location: 'Kathmandu, Nepal',
      rating: 4.8,
      totalEvents: 25,
      upcomingEvents: 5,
      totalTicketsSold: 12500,
      categories: ['Music', 'Concert', 'Festival'],
      description: 'Professional event organizer specializing in music festivals and concerts across Nepal.',
      website: 'www.eventmastersnepal.com',
      phone: '+977-1-234567',
      email: 'info@eventmastersnepal.com',
      verified: true
    },
    {
      id: 2,
      name: 'Himalayan Events Co.',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
      coverImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=300&fit=crop',
      location: 'Pokhara, Nepal',
      rating: 4.6,
      totalEvents: 18,
      upcomingEvents: 3,
      totalTicketsSold: 8900,
      categories: ['Adventure', 'Cultural', 'Workshop'],
      description: 'Organizing unique cultural and adventure events in the beautiful city of Pokhara.',
      website: 'www.himalayaneventscorp.com',
      phone: '+977-61-987654',
      email: 'contact@himalayaneventscorp.com',
      verified: true
    },
    {
      id: 3,
      name: 'Tech Conference Nepal',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
      coverImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=300&fit=crop',
      location: 'Lalitpur, Nepal',
      rating: 4.9,
      totalEvents: 12,
      upcomingEvents: 2,
      totalTicketsSold: 5600,
      categories: ['Technology', 'Conference', 'Workshop'],
      description: 'Leading organizer of technology conferences and IT workshops in Nepal.',
      website: 'www.techconferencenepal.com',
      phone: '+977-1-345678',
      email: 'hello@techconferencenepal.com',
      verified: false
    },
    {
      id: 4,
      name: 'Cultural Heritage Events',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b042?w=400&h=400&fit=crop',
      coverImage: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&h=300&fit=crop',
      location: 'Bhaktapur, Nepal',
      rating: 4.7,
      totalEvents: 30,
      upcomingEvents: 7,
      totalTicketsSold: 15200,
      categories: ['Cultural', 'Traditional', 'Festival'],
      description: 'Preserving and promoting Nepalese culture through traditional festivals and events.',
      website: 'www.culturalheritageevents.com',
      phone: '+977-1-456789',
      email: 'info@culturalheritageevents.com',
      verified: true
    },
    {
      id: 5,
      name: 'Sports Arena Nepal',
      avatar: 'https://images.unsplash.com/photo-1542178243-bc20204b769f?w=400&h=400&fit=crop',
      coverImage: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&h=300&fit=crop',
      location: 'Kathmandu, Nepal',
      rating: 4.5,
      totalEvents: 22,
      upcomingEvents: 4,
      totalTicketsSold: 18700,
      categories: ['Sports', 'Tournament', 'Athletic'],
      description: 'Organizing professional sports tournaments and athletic events across Nepal.',
      website: 'www.sportsarenanepal.com',
      phone: '+977-1-567890',
      email: 'contact@sportsarenanepal.com',
      verified: true
    },
    {
      id: 6,
      name: 'Artistic Vision Events',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
      coverImage: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&h=300&fit=crop',
      location: 'Kathmandu, Nepal',
      rating: 4.4,
      totalEvents: 16,
      upcomingEvents: 3,
      totalTicketsSold: 7800,
      categories: ['Art', 'Exhibition', 'Creative'],
      description: 'Curating artistic exhibitions and creative workshops for art enthusiasts.',
      website: 'www.artisticvisionevents.com',
      phone: '+977-1-678901',
      email: 'hello@artisticvisionevents.com',
      verified: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 ml-64">
      {/* Header */}
      {/* <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-semibold text-gray-900">Organisers</h1>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4 mr-2" />
              Add New Organiser
            </button>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Globe className="w-4 h-4" />
              <span>English</span>
            </div>
          </div>
        </div>
      </div> */}
      <div>
        <Navbar title="Organisers" addMessage="Add New Organiser" handleOpen={() => {}} />
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
      {/* main content  */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
          {organisers.map((organiser) => (
            <div key={organiser.id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              {/* Cover Image */}
              <div className="relative h-32 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
                <img
                  src={organiser.coverImage}
                  alt={`${organiser.name} cover`}
                  className="w-full h-full object-cover"
                />
                {organiser.verified && (
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      VERIFIED
                    </span>
                  </div>
                )}
              </div>

              {/* Profile Section */}
              <div className="relative px-4 py-4">
                {/* Avatar */}
                <div className="absolute -top-8 left-4">
                  <img
                    src={organiser.avatar}
                    alt={organiser.name}
                    className="w-16 h-16 rounded-full border-4 border-white object-cover"
                  />
                </div>

                {/* Content */}
                <div className="pt-10">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {organiser.name}
                      </h3>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <MapPin className="w-4 h-4 mr-1" />
                        {organiser.location}
                      </div>
                      <div className="flex items-center mb-3">
                        <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                        <span className="text-sm font-medium text-gray-900">{organiser.rating}</span>
                      </div>
                    </div>
                  </div>

                  {/* Categories */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {organiser.categories.map((category, index) => (
                      <span
                        key={index}
                        className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded"
                      >
                        {category}
                      </span>
                    ))}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {organiser.description}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                    <div className="bg-gray-50 rounded-lg p-2">
                      <div className="flex items-center justify-center mb-1">
                        <Calendar className="w-4 h-4 text-blue-500" />
                      </div>
                      <div className="text-sm font-semibold text-gray-900">{organiser.totalEvents}</div>
                      <div className="text-xs text-gray-600">Events</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <div className="flex items-center justify-center mb-1">
                        <Calendar className="w-4 h-4 text-green-500" />
                      </div>
                      <div className="text-sm font-semibold text-gray-900">{organiser.upcomingEvents}</div>
                      <div className="text-xs text-gray-600">Upcoming</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <div className="flex items-center justify-center mb-1">
                        <Users className="w-4 h-4 text-purple-500" />
                      </div>
                      <div className="text-sm font-semibold text-gray-900">{organiser.totalTicketsSold.toLocaleString()}</div>
                      <div className="text-xs text-gray-600">Tickets</div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-1 mb-4">
                    <div className="flex items-center text-xs text-gray-600">
                      <Globe className="w-3 h-3 mr-2" />
                      <span className="truncate">{organiser.website}</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <Phone className="w-3 h-3 mr-2" />
                      <span>{organiser.phone}</span>
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
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
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