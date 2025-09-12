"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [ticketFlip, setTicketFlip] = useState(false);

  // Flip ticket animation
  useEffect(() => {
    const interval = setInterval(() => {
      setTicketFlip(prev => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="font-sans flex flex-col items-center justify-center min-h-screen p-8 bg-black relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -left-10 w-72 h-72 bg-gray-800 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/3 -right-10 w-72 h-72 bg-gray-700 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-10 left-1/3 w-72 h-72 bg-gray-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      <main className="text-center max-w-3xl mx-auto relative z-10">
        {/* Animated Ticket Icon */}
        <div className="mb-8 relative">
          <div className={`w-32 h-20 mx-auto bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg shadow-2xl flex items-center justify-center transform transition-transform duration-700 ${ticketFlip ? 'rotate-y-180' : ''} relative`}>
            {/* Ticket perforations */}
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-black rounded-full -ml-2"></div>
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-black rounded-full -mr-2"></div>
            
            {/* Ticket content */}
            <div className="text-white text-2xl font-bold">🎫</div>
            
            {/* Dotted line */}
            <div className="absolute left-6 right-6 top-1/2 transform -translate-y-1/2 border-t-2 border-dashed border-white opacity-50"></div>
          </div>
          
          {/* Floating mini tickets */}
          <div className="absolute -top-2 -left-8 w-6 h-4 bg-yellow-400 rounded transform rotate-12 animate-bounce"></div>
          <div className="absolute -top-4 right-4 w-6 h-4 bg-green-400 rounded transform -rotate-12 animate-bounce animation-delay-1000"></div>
          <div className="absolute -bottom-2 -right-6 w-6 h-4 bg-red-400 rounded transform rotate-45 animate-bounce animation-delay-2000"></div>
        </div>

        {/* Main Heading with Animation */}
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 animate-fade-in-up">
          <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            Event Ticketing || Admin Panel
          </span>
        </h1>

        {/* Subheading */}
        <p className="text-2xl sm:text-3xl text-gray-300 mb-2 animate-fade-in-up animation-delay-500">
          Under Construction
        </p>
        
        <p className="text-lg text-gray-400 mb-8 animate-fade-in-up animation-delay-1000">
          Your gateway to unforgettable events
        </p>
      </main>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
          opacity: 0;
        }
        
        .animation-delay-500 {
          animation-delay: 0.5s;
        }
        
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}