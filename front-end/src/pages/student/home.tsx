import { useNavigate } from "react-router-dom";
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

const featuredCourses = [
  {
    id: "course1",
    title: "Web Development Masterclass",
    instructor: "John Smith",
    price: 1999,
    rating: 4.9,
    reviewCount: 128,
    thumbnail: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTV8fHdlYiUyMGRldmVsb3BtZW50fGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=800&q=60",
    category: "Programming",
    difficulty: "Intermediate"
  },
  {
    id: "course2",
    title: "Digital Marketing Fundamentals",
    instructor: "Amanda Lee",
    price: 1499,
    rating: 4.7,
    reviewCount: 85,
    thumbnail: "https://images.unsplash.com/photo-1533750349088-cd871a92f312?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTJ8fG1hcmtldGluZ3xlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60",
    category: "Marketing",
    difficulty: "Beginner"
  },
  {
    id: "course3",
    title: "Data Science with Python",
    instructor: "David Chen",
    price: 2499,
    rating: 4.8,
    reviewCount: 156,
    thumbnail: "https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8ZGF0YSUyMHNjaWVuY2V8ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60",
    category: "Data Science",
    difficulty: "Advanced"
  }
];

// Categories
const categories = [
  { icon: Code, name: "Programming", count: 238 },
  { icon: Database, name: "Data Science", count: 142 },
  { icon: Globe, name: "Marketing", count: 87 },
  { icon: Server, name: "Cloud Computing", count: 64 }
];

// Student testimonials
const testimonials = [
  { 
    name: "Sarah Johnson", 
    role: "Frontend Developer",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80", 
    content: "EduLearn helped me transition from a beginner to a professional developer in just 6 months. The course materials are up-to-date and the instructors are amazing.",
    rating: 5
  },
  { 
    name: "David Rodriguez", 
    role: "Data Scientist",
    avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80", 
    content: "The Data Science courses provided exactly what I needed to transition into a new career. The hands-on projects were incredibly valuable.",
    rating: 5
  },
  { 
    name: "Michelle Park", 
    role: "UX Designer", 
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80",
    content: "The practical projects gave me a portfolio that helped me land my dream job within three months of completing the UX Design Fundamentals course.",
    rating: 4
  }
];

const Index = () => {
  const navigate = useNavigate();

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
                Join over 100,000 learners acquiring in-demand skills with our expert-led courses and industry-recognized certifications.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button 
                  onClick={() => navigate("/courses")}
                  size="lg"
                  className="bg-blue-700 hover:bg-blue-800 text-white rounded-full px-8"
                >
                  Explore Courses
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full px-8 border-gray-400 text-gray-800 dark:text-gray-200"
                  onClick={() => navigate("/instructors")}
                >
                  Meet Our Instructors
                </Button>
              </div>
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
                  <button className="w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center hover:bg-white/30 transition group">
                    <Play className="h-8 w-8 text-white fill-white transform group-hover:scale-110 transition" />
                  </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black to-transparent">
                  <h3 className="text-xl font-bold text-white">Watch Our Course Demo</h3>
                  <p className="text-white/80">See how our platform can help you succeed</p>
                </div>
              </div>
              
              <div className="absolute bottom-6 -right-6 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-xl border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <img 
                        key={i}
                        src={`https://i.pravatar.cc/100?img=${i+20}`}
                        alt={`Student ${i}`}
                        className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800"
                      />
                    ))}
                  </div>
                  <div>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      Join 10,000+ happy students
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
            {["Google", "Microsoft", "Amazon", "Adobe", "IBM"].map((company) => (
              <div key={company} className="h-10 flex items-center justify-center">
                <span className="text-gray-400 dark:text-gray-500 font-bold text-2xl">{company}</span>
              </div>
            ))}
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
              Discover our most popular courses designed to help you reach your goals
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {featuredCourses.map((course) => (
              <Card 
                key={course.id}
                className="overflow-hidden bg-white dark:bg-gray-900 border-none shadow-lg hover:shadow-xl transition-shadow rounded-xl cursor-pointer"
                onClick={() => navigate(`/courses/${course.id}`)}
              >
                <div className="relative">
                  <div className="aspect-video w-full overflow-hidden">
                    <img 
                      src={course.thumbnail} 
                      alt={course.title}
                      className="w-full h-full object-cover transform transition-transform hover:scale-105" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.svg?text=Course";
                      }}
                    />
                  </div>
                  <div className="absolute top-4 left-4 z-10 flex gap-2">
                    <Badge className="bg-blue-600 text-white border-none">
                      {course.category}
                    </Badge>
                    <Badge variant="outline" className="bg-white/80 backdrop-blur-sm border-white text-gray-800">
                      {course.difficulty}
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2">
                      {course.title}
                    </h3>
                    <div className="flex items-center bg-blue-50 dark:bg-blue-900/30 rounded-lg px-2 py-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                      <span className="font-medium text-blue-700 dark:text-blue-300">
                        {course.rating}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 flex items-center">
                    <Users className="h-4 w-4 mr-2 inline" />
                    Instructor: {course.instructor}
                  </p>
                  
                  <Separator className="my-4" />
                  
                  <div className="flex items-center justify-between">
                    <p className="text-xl font-bold text-blue-700 dark:text-blue-400">
                      ₹{course.price.toFixed(2)}
                    </p>
                    <Button 
                      size="sm"
                      className="rounded-full bg-blue-700 hover:bg-blue-800 text-white"
                    >
                      Enroll Now
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button 
              variant="outline" 
              onClick={() => navigate("/courses")}
              className="rounded-full border-blue-600 text-blue-700 hover:bg-blue-50 dark:border-blue-500 dark:text-blue-400"
            >
              View All Courses
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
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
              Find the perfect course from our diverse range of categories
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {categories.map((category, index) => (
              <div 
                key={index}
                onClick={() => navigate(`/courses?category=${category.name}`)}
                className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 text-center"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center transform transition-transform group-hover:rotate-6">
                  <category.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">{category.name}</h3>
                <p className="text-blue-600 dark:text-blue-400 font-medium">{category.count} courses</p>
              </div>
            ))}
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
              Simple steps to start your learning journey with us
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connection lines */}
            <div className="hidden md:block absolute top-1/2 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-blue-200 via-indigo-300 to-blue-200 dark:from-blue-900 dark:via-indigo-600 dark:to-blue-900" style={{ transform: 'translateY(-50%)' }}></div>
            
            {/* Steps */}
            {[
              { 
                number: '01',
                title: 'Choose Your Course',
                description: 'Browse our extensive library of courses taught by industry experts.',
                icon: <BookOpen className="h-8 w-8 text-white" />,
                color: 'from-blue-500 to-blue-600',
              },
              { 
                number: '02',
                title: 'Learn at Your Pace',
                description: 'Access course content anytime and learn at your own schedule.',
                icon: <Clock className="h-8 w-8 text-white" />,
                color: 'from-indigo-500 to-purple-600',
              },
              { 
                number: '03',
                title: 'Get Certified',
                description: 'Complete assessments and receive industry-recognized certification.',
                icon: <Award className="h-8 w-8 text-white" />,
                color: 'from-purple-500 to-blue-600',
              }
            ].map((step, index) => (
              <div key={index} className="relative z-10">
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-8 h-full">
                  <div className={`absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center text-xl font-bold text-white`}>
                    {step.number}
                  </div>
                  <div className="mt-6 mb-5 flex justify-center">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center`}>
                      {step.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">{step.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-center">{step.description}</p>
                </div>
              </div>
            ))}
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
              Hear what our students have to say about their learning experience
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-lg p-8 relative">
                <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
                  <svg width="45" height="45" viewBox="0 0 45 45" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-200 dark:text-blue-900">
                    <path d="M13.2 22.5C16.4 22.5 18.9 25 18.9 28.2C18.9 31.4 16.4 33.9 13.2 33.9C10 33.9 7.5 31.4 7.5 28.2L7.425 27.075C7.425 19.575 13.575 13.425 21.075 13.425V18.075C18.15 18.075 15.45 19.125 13.425 21.15C13.8 21.075 14.175 21.075 14.55 21.075C15.9958 21.0755 17.4048 21.577 18.5291 22.4996C17.4048 21.577 15.9958 21.0755 14.55 21.075C14.175 21.075 13.8 21.075 13.425 21.15C15.45 19.125 18.15 18.075 21.075 18.075V13.425C13.575 13.425 7.425 19.575 7.425 27.075L7.5 28.2C7.5 31.4 10 33.9 13.2 33.9C16.4 33.9 18.9 31.4 18.9 28.2C18.9 25 16.4 22.5 13.2 22.5ZM32.7 22.5C35.9 22.5 38.4 25 38.4 28.2C38.4 31.4 35.9 33.9 32.7 33.9C29.5 33.9 27 31.4 27 28.2L26.925 27.075C26.925 19.575 33.075 13.425 40.575 13.425V18.075C37.65 18.075 34.95 19.125 32.925 21.15C33.3 21.075 33.675 21.075 34.05 21.075C35.4958 21.0755 36.9048 21.577 38.0291 22.4996C36.9048 21.577 35.4958 21.0755 34.05 21.075C33.675 21.075 33.3 21.075 32.925 21.15C34.95 19.125 37.65 18.075 40.575 18.075V13.425C33.075 13.425 26.925 19.575 26.925 27.075L27 28.2C27 31.4 29.5 33.9 32.7 33.9C35.9 33.9 38.4 31.4 38.4 28.2C38.4 25 35.9 22.5 32.7 22.5Z" fill="currentColor"/>
                  </svg>
                </div>
                
                <div className="mb-6">{renderStars(testimonial.rating)}</div>
                
                <p className="text-gray-700 dark:text-gray-300 italic mb-6">"{testimonial.content}"</p>
                
                <div className="flex items-center gap-4">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className="w-14 h-14 rounded-full object-cover border-4 border-white dark:border-gray-800"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `/placeholder.svg?height=56&width=56&text=${testimonial.name.charAt(0)}`;
                    }}
                  />
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-lg">{testimonial.name}</h4>
                    <p className="text-blue-600 dark:text-blue-400">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
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
            Ready to Start Learning New Skills Today?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Join thousands of students already learning on our platform. Get unlimited access to all courses for a special price!
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-10">
            <Button 
              onClick={() => navigate("/signup")}
              className="bg-white text-blue-700 hover:bg-blue-50 rounded-full"
              size="lg"
            >
              Get Started For Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              className="border-white text-white hover:bg-white/10 rounded-full"
              size="lg"
              onClick={() => navigate("/pricing")}
            >
              View Pricing Plans
            </Button>
          </div>
          
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-300" />
              <span className="text-white">7-day free trial</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-300" />
              <span className="text-white">Cancel anytime</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-300" />
              <span className="text-white">Certificate included</span>
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
                <span className="text-xl font-bold text-white">EduLearn</span>
              </div>
              <p className="text-sm text-gray-400 mb-6">
                Empowering individuals through quality education and skill development since 2020.
              </p>
              <div className="flex space-x-4">
                {["facebook", "twitter", "instagram", "linkedin"].map((social) => (
                  <a 
                    key={social} 
                    href="#" 
                    className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-300 hover:bg-blue-600 hover:text-white transition-colors"
                  >
                    <span className="sr-only">{social}</span>
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      {social === "facebook" && (
                        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                      )}
                      {social === "twitter" && (
                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                      )}
                      {social === "instagram" && (
                        <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
                      )}
                      {social === "linkedin" && (
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z" />
                      )}
                    </svg>
                  </a>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Courses</h3>
              <ul className="space-y-2">
                {["Web Development", "Data Science", "Mobile Development", "Cloud Computing", "AI & Machine Learning"].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-2">
                {["About Us", "Careers", "Partners", "Blog", "Contact Us"].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Newsletter</h3>
              <p className="text-sm text-gray-400 mb-4">
                Subscribe to our newsletter for the latest updates and course releases.
              </p>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  className="py-2 px-4 bg-gray-800 text-gray-300 rounded-l-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button className="rounded-l-none bg-blue-600 hover:bg-blue-700">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500">
              © 2025 EduLearn. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-sm text-gray-400 hover:text-blue-400">Privacy Policy</a>
              <a href="#" className="text-sm text-gray-400 hover:text-blue-400">Terms of Service</a>
              <a href="#" className="text-sm text-gray-400 hover:text-blue-400">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;