"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Button from "../../components/ui/Button";
import { 
  Users, 
  MessageCircle, 
  Heart, 
  Share2, 
  Calendar, 
  MapPin, 
  Star,
  ArrowRight,
  Plus,
  Search,
  Filter,
  TrendingUp,
  Award,
  Globe,
  Leaf
} from "lucide-react";

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState("all");

  const communityStats = [
    { label: "Active Members", value: "12,847", icon: Users, color: "text-emerald-600" },
    { label: "Posts This Month", value: "3,421", icon: MessageCircle, color: "text-blue-600" },
    { label: "Events Hosted", value: "156", icon: Calendar, color: "text-purple-600" },
    { label: "Impact Score", value: "98.7%", icon: TrendingUp, color: "text-orange-600" }
  ];

  const featuredPosts = [
    {
      id: 1,
      author: "Sarah Chen",
      avatar: "/assets/hero-sustainable-products.jpg",
      role: "Eco Warrior",
      time: "2 hours ago",
      title: "Just completed my 30-day zero waste challenge! 🌱",
      content: "Sharing my journey and the amazing tips I learned along the way. The impact on my carbon footprint has been incredible!",
      image: "/assets/hero-sustainable-products.jpg",
      likes: 234,
      comments: 45,
      shares: 12,
      tags: ["Zero Waste", "Sustainability", "Challenge"]
    },
    {
      id: 2,
      author: "Mike Rodriguez",
      avatar: "/assets/product-bamboo-bottle.jpg",
      role: "Green Innovator",
      time: "5 hours ago",
      title: "DIY Solar Panel Installation - Step by Step Guide",
      content: "Finally got my home running on 100% renewable energy! Here's how you can do it too with detailed instructions and cost breakdown.",
      image: "/assets/product-bamboo-bottle.jpg",
      likes: 189,
      comments: 67,
      shares: 23,
      tags: ["Solar", "DIY", "Renewable Energy"]
    },
    {
      id: 3,
      author: "Emma Thompson",
      avatar: "/assets/product-cotton-bags.jpg",
      role: "Community Leader",
      time: "1 day ago",
      title: "Community Garden Update - Spring Planting Season",
      content: "Our community garden is thriving! Check out the progress and join us for the next planting session this weekend.",
      image: "/assets/product-cotton-bags.jpg",
      likes: 156,
      comments: 34,
      shares: 8,
      tags: ["Community Garden", "Spring", "Volunteer"]
    }
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: "Sustainable Living Workshop",
      date: "March 15, 2024",
      time: "2:00 PM - 4:00 PM",
      location: "Green Community Center",
      attendees: 45,
      maxAttendees: 60,
      type: "Workshop"
    },
    {
      id: 2,
      title: "Beach Cleanup Drive",
      date: "March 20, 2024",
      time: "8:00 AM - 12:00 PM",
      location: "Sunset Beach",
      attendees: 78,
      maxAttendees: 100,
      type: "Volunteer"
    },
    {
      id: 3,
      title: "Eco-Friendly Cooking Class",
      date: "March 25, 2024",
      time: "6:00 PM - 8:00 PM",
      location: "Culinary Arts Center",
      attendees: 23,
      maxAttendees: 30,
      type: "Class"
    }
  ];

  const topContributors = [
    { name: "Sarah Chen", points: 2847, level: "Eco Master", avatar: "/assets/hero-sustainable-products.jpg" },
    { name: "Mike Rodriguez", points: 2156, level: "Green Innovator", avatar: "/assets/product-bamboo-bottle.jpg" },
    { name: "Emma Thompson", points: 1923, level: "Community Leader", avatar: "/assets/product-cotton-bags.jpg" },
    { name: "Alex Kumar", points: 1754, level: "Sustainability Expert", avatar: "/assets/product-skincare-set.jpg" },
    { name: "Lisa Park", points: 1632, level: "Eco Warrior", avatar: "/assets/category-zero-waste(1).jpg" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-emerald-600 to-blue-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-10 right-10 w-48 h-48 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Users className="w-8 h-8" />
              <span className="text-lg font-semibold">AveoEarth Community</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Together for a
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                Sustainable Future
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-emerald-100 mb-8 max-w-3xl mx-auto">
              Join thousands of eco-conscious individuals sharing ideas, inspiring change, and building a greener tomorrow.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg">
                <Plus className="w-5 h-5 mr-2" />
                Join Community
              </Button>
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-emerald-600">
                <MessageCircle className="w-5 h-5 mr-2" />
                Start Discussion
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {communityStats.map((stat, index) => (
              <div key={index} className="text-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl hover:shadow-lg transition-all duration-300">
                <stat.icon className={`w-8 h-8 mx-auto mb-3 ${stat.color}`} />
                <div className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Posts */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-gray-800">Community Posts</h2>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex gap-2 mb-6">
                {["all", "trending", "recent", "events"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      activeTab === tab
                        ? "bg-emerald-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {/* Posts */}
              <div className="space-y-6">
                {featuredPosts.map((post) => (
                  <div key={post.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <Image
                          src={post.avatar}
                          alt={post.author}
                          width={48}
                          height={48}
                          className="rounded-full"
                        />
                        <div>
                          <div className="font-semibold text-gray-800">{post.author}</div>
                          <div className="text-sm text-gray-500">{post.role} • {post.time}</div>
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-800 mb-3">{post.title}</h3>
                      <p className="text-gray-600 mb-4">{post.content}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex gap-6">
                          <button className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors">
                            <Heart className="w-5 h-5" />
                            {post.likes}
                          </button>
                          <button className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors">
                            <MessageCircle className="w-5 h-5" />
                            {post.comments}
                          </button>
                          <button className="flex items-center gap-2 text-gray-500 hover:text-green-500 transition-colors">
                            <Share2 className="w-5 h-5" />
                            {post.shares}
                          </button>
                        </div>
                        <Button size="sm" variant="outline">
                          View Post
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Upcoming Events */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                  Upcoming Events
                </h3>
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-800">{event.title}</h4>
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                          {event.type}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {event.date} at {event.time}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {event.location}
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          {event.attendees}/{event.maxAttendees} attendees
                        </div>
                      </div>
                      <Button size="sm" className="w-full mt-3">
                        Join Event
                      </Button>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View All Events
                </Button>
              </div>

              {/* Top Contributors */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-600" />
                  Top Contributors
                </h3>
                <div className="space-y-3">
                  {topContributors.map((contributor, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-emerald-600">#{index + 1}</span>
                        <Image
                          src={contributor.avatar}
                          alt={contributor.name}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800">{contributor.name}</div>
                        <div className="text-sm text-gray-500">{contributor.level}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-emerald-600">{contributor.points}</div>
                        <div className="text-xs text-gray-500">points</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gradient-to-br from-emerald-600 to-blue-600 rounded-2xl p-6 text-white">
                <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button className="w-full bg-white text-emerald-600 hover:bg-emerald-50">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Post
                  </Button>
                  <Button variant="outline" className="w-full border-white text-white hover:bg-white hover:text-emerald-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    Host Event
                  </Button>
                  <Button variant="outline" className="w-full border-white text-white hover:bg-white hover:text-emerald-600">
                    <Globe className="w-4 h-4 mr-2" />
                    Find Groups
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
            Join our community of changemakers and start your sustainability journey today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg">
              <Users className="w-5 h-5 mr-2" />
              Join Now
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-emerald-600">
              <Leaf className="w-5 h-5 mr-2" />
              Learn More
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
