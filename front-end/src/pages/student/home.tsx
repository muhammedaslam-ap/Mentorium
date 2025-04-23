"use client";

import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  BookOpen,
  Code,
  Database,
  Globe,
  Server,
  Laptop,
  Clock,
  Users,
  Award,
  Zap,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import { RootState } from "@/redux/store";
import { removeUser } from "@/redux/slice/userSlice";
import { userAuthService } from "@/services/userServices/authServices";
import Header from "./components/header";

// Define interfaces for data structures and props
interface Category {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  count: number;
}

interface Testimonial {
  name: string;
  role: string;
  image: string;
  quote: string;
  rating: number;
}

interface Feature {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

// Category Card Component
const CategoryCard: React.FC<Category> = ({ icon: Icon, title, count }) => (
  <div className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-fade-in">
    <div className="flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/50 flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">{count} courses</p>
    </div>
  </div>
);

// Testimonial Card Component
const TestimonialCard: React.FC<Testimonial> = ({ name, role, image, quote, rating }) => (
  <div className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-lg animate-fade-in">
    <div className="flex items-center gap-4 mb-4">
      <img
        src={image}
        alt={name}
        className="w-12 h-12 rounded-full border-2 border-blue-100 dark:border-blue-900 object-cover"
      />
      <div>
        <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">{name}</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">{role}</p>
      </div>
    </div>
    <div className="flex mb-4">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={`w-5 h-5 ${i < rating ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
    <p className="text-gray-600 dark:text-gray-300 italic">“{quote}”</p>
  </div>
);

// Feature Card Component
const FeatureCard: React.FC<Feature> = ({ icon: Icon, title, description }) => (
  <div className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-fade-in">
    <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-900/50 flex items-center justify-center mb-4 mx-auto">
      <Icon className="h-7 w-7 text-blue-600 dark:text-blue-400" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
    <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
  </div>
);

// Main UserHomePage Component
export function UserHomePage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user.userDatas);
  const isAuthenticated = !!user;


  const handleProtectedNavigation = (path: string) => {
    if (!isAuthenticated) {
      toast.error("Please login to access this page", { duration: 3000 });
    } else {
      navigate(path);
    }
  };

  const handleLogout = async () => {
    try {
      console.log("Calling logoutUser");
      await userAuthService.logoutUser();
      dispatch(removeUser());
      localStorage.removeItem("userDatas");
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
  };

  const categories: Category[] = [
    { icon: Code, title: "Web Development", count: 120 },
    { icon: Database, title: "Data Science", count: 85 },
    { icon: Server, title: "Cloud Computing", count: 64 },
    { icon: Globe, title: "Mobile Development", count: 72 },
  ];

  const testimonials: Testimonial[] = [
    {
      name: "Sarah Johnson",
      role: "Frontend Developer",
      image: "/placeholder.svg?height=48&width=48&text=SJ",
      quote: "The courses on EduShare helped me transition from a beginner to a professional developer in just 6 months.",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Data Scientist",
      image: "/placeholder.svg?height=48&width=48&text=MC",
      quote: "The data science curriculum is comprehensive and up-to-date with industry standards. Highly recommended!",
      rating: 4,
    },
    {
      name: "Jessica Williams",
      role: "UX Designer",
      image: "/placeholder.svg?height=48&width=48&text=JW",
      quote: "I've taken courses on multiple platforms, but EduShare offers the best balance of theory and practical projects.",
      rating: 5,
    },
  ];

  const features: Feature[] = [
    {
      icon: Laptop,
      title: "Learn Anywhere",
      description: "Access courses on any device, anytime, anywhere",
    },
    {
      icon: Award,
      title: "Earn Certificates",
      description: "Get recognized for your achievements with shareable certificates",
    },
    {
      icon: Users,
      title: "Expert Instructors",
      description: "Learn from industry professionals with real-world experience",
    },
    {
      icon: Clock,
      title: "Self-Paced Learning",
      description: "Study at your own pace with lifetime access to courses",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full bg-gradient-to-br from-gray-100 to-blue-100 dark:from-gray-800 dark:to-blue-900 py-16 md:py-24 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-grid-gray-200/50 dark:bg-grid-gray-700/50 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
          <div className="container mx-auto px-4 md:px-6 lg:px-8 relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6 animate-fade-in">
                <div className="inline-flex items-center bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 rounded-full px-4 py-1 text-sm font-medium">
                  <Zap className="mr-2 h-4 w-4" /> Over 500+ courses available
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                  Learn the skills you need to <span className="text-blue-600 dark:text-blue-400">succeed</span>
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 max-w-md">
                  Access high-quality courses taught by industry experts. Start your learning journey today and transform your career.
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => handleProtectedNavigation("/courses")}
                    className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Browse Courses <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                  <button
                    onClick={() => navigate("/paths")}
                    className="inline-flex items-center bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    View Learning Paths
                  </button>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-300">
                  <span className="flex items-center"><CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mr-2" /> Expert instructors</span>
                  <span className="flex items-center"><CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mr-2" /> Flexible learning</span>
                  <span className="flex items-center"><CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mr-2" /> Certificates</span>
                </div>
              </div>
              <div className="relative animate-fade-in">
                <div className="absolute -top-12 -right-12 w-64 h-64 bg-blue-200 dark:bg-blue-800/30 rounded-full blur-3xl"></div>
                <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                  <video
                    src="/CN4By7T88Hg2dj5lqo.mp4"
                    className="w-full h-auto"
                    autoPlay
                    loop
                    muted
                    playsInline
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                    <h3 className="text-xl font-semibold text-white">Start Learning Today</h3>
                    <p className="text-sm text-white">Join thousands of students worldwide</p>
                  </div>
                </div>
                <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-blue-100 dark:bg-blue-900/30 rounded-full blur-2xl"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="w-full py-12 bg-white dark:bg-gray-800 border-y border-gray-200 dark:border-gray-700">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="animate-fade-in">
                <h2 className="text-3xl font-bold text-blue-600 dark:text-blue-400">500+</h2>
                <p className="text-gray-600 dark:text-gray-400">Courses</p>
              </div>
              <div className="animate-fade-in">
                <h2 className="text-3xl font-bold text-blue-600 dark:text-blue-400">50k+</h2>
                <p className="text-gray-600 dark:text-gray-400">Students</p>
              </div>
              <div className="animate-fade-in">
                <h2 className="text-3xl font-bold text-blue-600 dark:text-blue-400">100+</h2>
                <p className="text-gray-600 dark:text-gray-400">Instructors</p>
              </div>
              <div className="animate-fade-in">
                <h2 className="text-3xl font-bold text-blue-600 dark:text-blue-400">95%</h2>
                <p className="text-gray-600 dark:text-gray-400">Satisfaction</p>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="w-full py-16 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="text-center mb-12 animate-fade-in">
              <span className="inline-flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-4 py-1 text-sm font-medium text-gray-600 dark:text-gray-300">
                Explore by Category
              </span>
              <h2 className="mt-4 text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
                Find Your Perfect Course
              </h2>
              <p className="mt-2 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Browse through our diverse range of courses categorized by field of study
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((category, index) => (
                <CategoryCard key={index} {...category} />
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-16 bg-white dark:bg-gray-800">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="text-center mb-12 animate-fade-in">
              <span className="inline-flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-4 py-1 text-sm font-medium text-gray-600 dark:text-gray-300">
                Why Choose Us
              </span>
              <h2 className="mt-4 text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
                Learning Made Simple
              </h2>
              <p className="mt-2 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Our platform is designed to provide you with the best learning experience
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <FeatureCard key={index} {...feature} />
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="w-full py-16 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="text-center mb-12 animate-fade-in">
              <span className="inline-flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-4 py-1 text-sm font-medium text-gray-600 dark:text-gray-300">
                Student Success Stories
              </span>
              <h2 className="mt-4 text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
                What Our Students Say
              </h2>
              <p className="mt-2 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Hear from our students who have transformed their careers through our platform
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <TestimonialCard key={index} {...testimonial} />
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full bg-blue-600 dark:bg-blue-800 text-white py-16 md:py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_80%)]"></div>
          <div className="container mx-auto px-4 md:px-6 lg:px-8 relative">
            <div className="max-w-2xl mx-auto text-center space-y-8 animate-fade-in">
              <h2 className="text-3xl md:text-4xl font-bold">
                Ready to Start Your Learning Journey?
              </h2>
              <p className="text-lg">
                Join thousands of students already learning on EduShare and transform your career today.
              </p>
              <div className="flex justify-center gap-4">
                {isAuthenticated ? (
                  <>
                    <button
                      onClick={() => handleProtectedNavigation("/profile")}
                      className="inline-flex items-center bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="inline-flex items-center bg-blue-700 dark:bg-blue-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 dark:hover:bg-blue-950 transition-colors"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/auth"
                      className="inline-flex items-center bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                    >
                      Sign Up for Free <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleProtectedNavigation("/courses")}
                      className="inline-flex items-center bg-blue-700 dark:bg-blue-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 dark:hover:bg-blue-950 transition-colors"
                    >
                      Explore Courses
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400">EduShare</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Empowering learners worldwide with high-quality tech education. Our mission is to make education accessible to everyone.
              </p>
              <div className="flex gap-2">
                {["facebook", "twitter", "instagram", "linkedin"].map((platform) => (
                  <a
                    key={platform}
                    href="#"
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      {platform === "facebook" && (
                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                      )}
                      {platform === "twitter" && (
                        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                      )}
                      {platform === "instagram" && (
                        <>
                          <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                        </>
                      )}
                      {platform === "linkedin" && (
                        <>
                          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                          <rect width="4" height="12" x="2" y="9"></rect>
                          <circle cx="4" cy="4" r="2"></circle>
                        </>
                      )}
                    </svg>
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Courses</h4>
              <ul className="space-y-3">
                {["Web Development", "Data Science", "Cloud Computing", "Mobile Development"].map(
                  (item) => (
                    <li key={item}>
                      <Link
                        to="/courses"
                        className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        {item}
                      </Link>
                    </li>
                  )
                )}
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Company</h4>
              <ul className="space-y-3">
                {["About Us", "Careers", "Contact", "Blog"].map((item) => (
                  <li key={item}>
                    <Link
                      to={item === "About Us" ? "/about" : "#"}
                      className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {item}
                    </Link>
                  </li>
                  ))}
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Legal</h4>
              <ul className="space-y-3">
                {["Terms of Service", "Privacy Policy", "Cookie Policy"].map((item) => (
                  <li key={item}>
                    <Link
                      to="#"
                      className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <hr className="my-8 border-gray-200 dark:border-gray-700" />
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © 2025 EduShare. All rights reserved.
            </p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <Link
                to="#"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Help Center
              </Link>
              <Link
                to="#"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Accessibility
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}