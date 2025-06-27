import React from "react";
import { Users, Video, MessageCircle, BookOpen, Code } from "lucide-react";
import Header from "../student/components/header";

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      <div className="max-w-5xl mx-auto p-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4 flex items-center justify-center gap-3">
            <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-pulse" />
            About Mentorium
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover the story behind Mentorium, a platform designed to empower learners with cutting-edge education and community support.
          </p>
        </div>

        <div className="grid gap-8">
          {/* About Mentorium */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              What is Mentorium?
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Mentorium is an innovative online learning platform launched in 2025 by Muhammed Aslam, a skilled MERN stack developer. Designed to bridge the gap between traditional education and modern needs, Mentorium offers a dynamic environment where students can purchase courses, connect with expert tutors via video calls, engage in community chats with peers who share the same learning path, and grow at their own pace.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              Our mission is to provide accessible, high-quality education tailored to individual goals, fostering a supportive community that inspires lifelong learning.
            </p>
          </div>

          {/* Features */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Code className="h-6 w-6 text-green-500" />
              Our Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-2">
                <Video className="h-5 w-5 text-red-500 mt-1" />
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Video Calls with Tutors:</strong> Personalized guidance from experts to clarify doubts and accelerate learning.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <MessageCircle className="h-5 w-5 text-purple-500 mt-1" />
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Community Chats:</strong> Connect with peers who’ve bought the same course for collaborative learning.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <BookOpen className="h-5 w-5 text-yellow-500 mt-1" />
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Course Marketplace:</strong> A wide range of courses to purchase, designed for all skill levels.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Users className="h-5 w-5 text-teal-500 mt-1" />
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Supportive Community:</strong> A network to share ideas, ask questions, and grow together.
                </p>
              </div>
            </div>
          </div>

          {/* About the Founder */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Users className="h-6 w-6 text-indigo-500" />
              About the Founder
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Mentorium was brought to life by Muhammed Aslam, a passionate MERN stack developer with a vision to revolutionize online education. With expertise in MongoDB, Express.js, React, and Node.js, Aslam developed this platform in 2025 to provide a seamless and interactive learning experience. His dedication to technology and education drives Mentorium’s mission to empower learners worldwide.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              Aslam’s journey began with a desire to create a space where knowledge meets community, and Mentorium stands as a testament to that dream.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;