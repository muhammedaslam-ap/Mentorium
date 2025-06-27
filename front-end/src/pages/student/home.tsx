import React from "react";
import { 
  BookOpen, 
  ArrowRight, 
  Play, 
  Star, 
  Award, 
  Users, 
  ChevronRight, 
  CheckCircle, 
  Zap, 
  Globe, 
  Code, 
  Database, 
  Server,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "./components/header";
import { Separator } from "@/components/ui/separator";

const Index = () => {
  // Helper function to generate star ratings
  const renderStars = (rating) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={`h-4 w-4 ${i < Math.floor(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />
      
      {/* Hero Section - Modern Design with Overlap */}
      <section className="relative pt-20 pb-32 overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 max-w-2xl">
              <Badge className="px-3 py-1 text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 border-none">
                Next-Gen Learning Platform
              </Badge>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-800 to-indigo-600 dark:from-blue-400 dark:to-indigo-300">
                Master New Skills<br />Transform Your Future
              </h1>
              <p className="text-xl text-gray-700 dark:text-gray-300">
                Join learners worldwide with expert-led courses and recognized certifications.
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-500" />Flexible learning</span>
                <span className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-500" />Expert instructors</span>
                <span className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-500" />Career certifications</span>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-yellow-300 dark:bg-yellow-600 rounded-full opacity-30 blur-3xl"></div>
              <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-blue-300 dark:bg-blue-600 rounded-full opacity-30 blur-3xl"></div>
              
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/20 backdrop-blur-sm">
                <img 
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MjF8fGVkdWNhdGlvbnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60" 
                  alt="Students learning"
                  className="w-full h-auto aspect-video object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
                  <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                    <Play className="h-8 w-8 text-white fill-white" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black to-transparent">
                  <h3 className="text-xl font-bold text-white">Watch Our Course Demo</h3>
                  <p className="text-white/80">Explore how we support your success</p>
                </div>
              </div>
              
              <div className="absolute bottom-6 -right-6 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-xl border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    <img 
                      src="https://i.pravatar.cc/100?img=21"
                      alt="Student 1"
                      className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800"
                    />
                    <img 
                      src="https://i.pravatar.cc/100?img=22"
                      alt="Student 2"
                      className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800"
                    />
                    <img 
                      src="https://i.pravatar.cc/100?img=23"
                      alt="Student 3"
                      className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800"
                    />
                  </div>
                  <div>
                    <div className="flex">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      Join thousands of happy students
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto">
            <path 
              fill="currentColor" 
              fillOpacity="1" 
              className="text-white dark:text-gray-900"
              d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,202.7C672,203,768,181,864,186.7C960,192,1056,224,1152,218.7C1248,213,1344,171,1392,149.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            ></path>
          </svg>
        </div>
      </section>
      
      {/* Trusted By Section */}
      <section className="py-10 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-6">
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">TRUSTED BY LEADING COMPANIES</p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-12">
            <span className="text-gray-400 dark:text-gray-500 font-bold text-2xl">Google</span>
            <span className="text-gray-400 dark:text-gray-500 font-bold text-2xl">Microsoft</span>
            <span className="text-gray-400 dark:text-gray-500 font-bold text-2xl">Amazon</span>
          </div>
        </div>
      </section>
      
      {/* Featured Courses Section - Card Grid */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <Badge className="mb-4 px-3 py-1 text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
              Featured Courses
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Learn From The Best
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Explore top courses designed to help you achieve your goals.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="overflow-hidden bg-white dark:bg-gray-900 border-none shadow-lg rounded-xl">
              <div className="relative">
                <div className="aspect-video w-full overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1504639725590-34d0984388bd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTV8fHdlYiUyMGRldmVsb3BtZW50fGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=800&q=60" 
                    alt="Web Development"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder.svg?text=Course";
                    }}
                  />
                </div>
                <div className="absolute top-4 left-4 z-10 flex gap-2">
                  <Badge className="bg-blue-600 text-white border-none">
                    Programming
                  </Badge>
                  <Badge variant="outline" className="bg-white/80 backdrop-blur-sm border-white text-gray-800">
                    Intermediate
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2">
                    Web Development Masterclass
                  </h3>
                  <div className="flex items-center bg-blue-50 dark:bg-blue-900/30 rounded-lg px-2 py-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <span className="font-medium text-blue-700 dark:text-blue-300">
                      4.9
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 flex items-center">
                  <Users className="h-4 w-4 mr-2 inline" />
                  Instructor: John Smith
                </p>
                
                <Separator className="my-4" />
                
                <div className="flex items-center justify-between">
                  <p className="text-xl font-bold text-blue-700 dark:text-blue-400">
                    ₹1999
                  </p>
                  <Button 
                    size="sm"
                    className="rounded-full bg-blue-700 hover:bg-blue-800 text-white"
                  >
                    Enroll Now
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card className="overflow-hidden bg-white dark:bg-gray-900 border-none shadow-lg rounded-xl">
              <div className="relative">
                <div className="aspect-video w-full overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1533750349088-cd871a92f312?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTJ8fG1hcmtldGluZ3xlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60" 
                    alt="Digital Marketing"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder.svg?text=Course";
                    }}
                  />
                </div>
                <div className="absolute top-4 left-4 z-10 flex gap-2">
                  <Badge className="bg-blue-600 text-white border-none">
                    Marketing
                  </Badge>
                  <Badge variant="outline" className="bg-white/80 backdrop-blur-sm border-white text-gray-800">
                    Beginner
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2">
                    Digital Marketing Fundamentals
                  </h3>
                  <div className="flex items-center bg-blue-50 dark:bg-blue-900/30 rounded-lg px-2 py-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <span className="font-medium text-blue-700 dark:text-blue-300">
                      4.7
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 flex items-center">
                  <Users className="h-4 w-4 mr-2 inline" />
                  Instructor: Amanda Lee
                </p>
                
                <Separator className="my-4" />
                
                <div className="flex items-center justify-between">
                  <p className="text-xl font-bold text-blue-700 dark:text-blue-400">
                    ₹1499
                  </p>
                  <Button 
                    size="sm"
                    className="rounded-full bg-blue-700 hover:bg-blue-800 text-white"
                  >
                    Enroll Now
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card className="overflow-hidden bg-white dark:bg-gray-900 border-none shadow-lg rounded-xl">
              <div className="relative">
                <div className="aspect-video w-full overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8ZGF0YSUyMHNjaWVuY2V8ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60" 
                    alt="Data Science"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder.svg?text=Course";
                    }}
                  />
                </div>
                <div className="absolute top-4 left-4 z-10 flex gap-2">
                  <Badge className="bg-blue-600 text-white border-none">
                    Data Science
                  </Badge>
                  <Badge variant="outline" className="bg-white/80 backdrop-blur-sm border-white text-gray-800">
                    Advanced
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2">
                    Data Science with Python
                  </h3>
                  <div className="flex items-center bg-blue-50 dark:bg-blue-900/30 rounded-lg px-2 py-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <span className="font-medium text-blue-700 dark:text-blue-300">
                      4.8
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 flex items-center">
                  <Users className="h-4 w-4 mr-2 inline" />
                  Instructor: David Chen
                </p>
                
                <Separator className="my-4" />
                
                <div className="flex items-center justify-between">
                  <p className="text-xl font-bold text-blue-700 dark:text-blue-400">
                    ₹2499
                  </p>
                  <Button 
                    size="sm"
                    className="rounded-full bg-blue-700 hover:bg-blue-800 text-white"
                  >
                    Enroll Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Categories Section with Icons */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <Badge className="mb-4 px-3 py-1 text-sm bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100">
              Course Categories
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Explore Our Categories
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Discover a variety of courses across multiple fields.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <Code className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">Programming</h3>
              <p className="text-blue-600 dark:text-blue-400 font-medium">200+ courses</p>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <Database className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">Data Science</h3>
              <p className="text-blue-600 dark:text-blue-400 font-medium">150+ courses</p>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <Globe className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">Marketing</h3>
              <p className="text-blue-600 dark:text-blue-400 font-medium">100+ courses</p>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <Server className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">Cloud Computing</h3>
              <p className="text-blue-600 dark:text-blue-400 font-medium">80+ courses</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <Badge className="mb-4 px-3 py-1 text-sm bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
              Learning Process
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How Our Platform Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Simple steps to begin your learning journey.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12 relative">
            <div className="relative z-10">
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-8 h-full">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-xl font-bold text-white">
                  01
                </div>
                <div className="mt-6 mb-5 flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <BookOpen className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">Choose Your Course</h3>
                <p className="text-gray-600 dark:text-gray-300 text-center">Explore a wide range of expert-led courses.</p>
              </div>
            </div>
            <div className="relative z-10">
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-8 h-full">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl font-bold text-white">
                  02
                </div>
                <div className="mt-6 mb-5 flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <Clock className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">Learn at Your Pace</h3>
                <p className="text-gray-600 dark:text-gray-300 text-center">Access content anytime that suits you.</p>
              </div>
            </div>
            <div className="relative z-10">
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-8 h-full">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-xl font-bold text-white">
                  03
                </div>
                <div className="mt-6 mb-5 flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                    <Award className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">Get Certified</h3>
                <p className="text-gray-600 dark:text-gray-300 text-center">Earn recognized certifications upon completion.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <Badge className="mb-4 px-3 py-1 text-sm bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100">
              Student Stories
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              From Our Students
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Hear about the transformative learning experience.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-lg p-8">
              <div className="mb-6">{renderStars(5)}</div>
              <p className="text-gray-700 dark:text-gray-300 italic mb-6">"A great platform for skill development."</p>
              <div className="flex items-center gap-4">
                <img 
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80" 
                  alt="Sarah Johnson"
                  className="w-14 h-14 rounded-full object-cover border-4 border-white dark:border-gray-800"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.svg?height=56&width=56&text=S";
                  }}
                />
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-lg">Sarah Johnson</h4>
                  <p className="text-blue-600 dark:text-blue-400">Frontend Developer</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-lg p-8">
              <div className="mb-6">{renderStars(5)}</div>
              <p className="text-gray-700 dark:text-gray-300 italic mb-6">"Excellent resources for career growth."</p>
              <div className="flex items-center gap-4">
                <img 
                  src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80" 
                  alt="David Rodriguez"
                  className="w-14 h-14 rounded-full object-cover border-4 border-white dark:border-gray-800"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.svg?height=56&width=56&text=D";
                  }}
                />
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-lg">David Rodriguez</h4>
                  <p className="text-blue-600 dark:text-blue-400">Data Scientist</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-lg p-8">
              <div className="mb-6">{renderStars(4)}</div>
              <p className="text-gray-700 dark:text-gray-300 italic mb-6">"Practical projects boosted my career."</p>
              <div className="flex items-center gap-4">
                <img 
                  src="https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80" 
                  alt="Michelle Park"
                  className="w-14 h-14 rounded-full object-cover border-4 border-white dark:border-gray-800"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.svg?height=56&width=56&text=M";
                  }}
                />
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-lg">Michelle Park</h4>
                  <p className="text-blue-600 dark:text-blue-400">UX Designer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-900">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M0 10 H40 M10 0 V40" fill="none" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)"/>
          </svg>
        </div>
        
        <div className="container relative mx-auto px-4 sm:px-6 text-center">
          <Badge className="mb-6 px-4 py-1.5 text-sm bg-white/20 text-white border-none">
            <Zap className="h-3.5 w-3.5 mr-1" /> Limited Time Offer
          </Badge>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 max-w-3xl mx-auto">
            Ready to Start Learning?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Join our community and access top-quality courses.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              className="bg-white text-blue-700 hover:bg-blue-50 rounded-full"
              size="lg"
            >
              Get Started
            </Button>
            <Button 
              variant="outline" 
              className="border-white text-white hover:bg-white/10 rounded-full"
              size="lg"
            >
              Learn More
            </Button>
          </div>
          
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-4 mt-8">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-300" />
              <span className="text-white">Flexible learning</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-300" />
              <span className="text-white">Expert support</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-300" />
              <span className="text-white">Certifications</span>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 pt-16 pb-8 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-4 gap-8 mb-16">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-6 w-6 text-blue-400" />
                <span className="text-xl font-bold text-white">Mentorium</span>
              </div>
              <p className="text-sm text-gray-400 mb-6">
                Empowering learners through quality education.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Courses</h3>
              <ul className="space-y-2">
                <li><span className="text-gray-400">Web Development</span></li>
                <li><span className="text-gray-400">Data Science</span></li>
                <li><span className="text-gray-400">Marketing</span></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-2">
                <li><span className="text-gray-400">About Us</span></li>
                <li><span className="text-gray-400">Contact</span></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Newsletter</h3>
              <p className="text-sm text-gray-400 mb-4">
                Stay updated with our latest courses.
              </p>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500">
              © 2025 EduLearn. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <span className="text-sm text-gray-400">Privacy Policy</span>
              <span className="text-sm text-gray-400">Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;