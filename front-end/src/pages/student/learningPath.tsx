import React from "react";
import { BookOpen, Clock, Target, Book, Play, Clock as ClockIcon, Users, Award, Clock10 } from "lucide-react";
import Header from "../student/components/header";

const LearningPathPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      <div className="max-w-5xl mx-auto p-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4 flex items-center justify-center gap-3">
            <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-pulse" />
            How to Learn Effectively
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Unlock your potential with these comprehensive tips and a suggested study schedule to excel in your learning journey!
          </p>
        </div>

        <div className="grid gap-8">
          {/* Set Clear Goals */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Target className="h-6 w-6 text-green-500" />
              Set Clear Goals
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              Define specific, measurable objectives to stay focused and track progress. Examples include:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-400">
              <li>Complete one chapter (e.g., Chapter 1 of "HTML Basics").</li>
              <li>Master CSS selectors in 2 hours.</li>
              <li>Review last week's notes.</li>
            </ul>
          </div>

          {/* Break Down Topics */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Book className="h-6 w-6 text-yellow-500" />
              Break Down Topics
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              Divide complex subjects into manageable parts for gradual learning. Try:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-400">
              <li>Split JavaScript into variables, functions, and loops.</li>
              <li>Learn one CSS property (e.g., flexbox) at a time.</li>
              <li>Use flashcards for quick revision.</li>
            </ul>
          </div>

          {/* Practice Actively */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Play className="h-6 w-6 text-red-500" />
              Practice Actively
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              Engage with hands-on activities to solidify knowledge. Ideas include:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-400">
              <li>Build a webpage with HTML and CSS.</li>
              <li>Solve coding challenges on Codecademy.</li>
              <li>Take quizzes to test understanding.</li>
            </ul>
          </div>

          {/* Take Regular Breaks */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <ClockIcon className="h-6 w-6 text-purple-500" />
              Take Regular Breaks
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              Rest to avoid burnout and boost retention. Follow these:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-400">
              <li>Use Pomodoro: 25 minutes study, 5-minute break.</li>
              <li>Take a 15-30 minute break after 2-3 hours.</li>
              <li>Stretch or step outside to refresh.</li>
            </ul>
          </div>

          {/* Review and Revise */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-indigo-500" />
              Review and Revise
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              Strengthen memory with regular revision. Effective methods:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-400">
              <li>Review notes weekly.</li>
              <li>Create mind maps for connections.</li>
              <li>Teach a friend or write a summary.</li>
            </ul>
          </div>

          {/* Seek Support */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Users className="h-6 w-6 text-teal-500" />
              Seek Support
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              Collaborate to enhance learning. Options include:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-400">
              <li>Join community chats with peers.</li>
              <li>Schedule tutor video calls.</li>
              <li>Ask questions on forums like Stack Overflow.</li>
            </ul>
          </div>

          {/* Stay Motivated */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Award className="h-6 w-6 text-orange-500" />
              Stay Motivated
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              Keep your enthusiasm alive with these strategies:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-400">
              <li>Reward yourself after milestones (e.g., a snack).</li>
              <li>Visualize career goals like a web dev job.</li>
              <li>Track progress with a journal.</li>
            </ul>
          </div>

          {/* Manage Time Wisely */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Clock10 className="h-6 w-6 text-pink-500" />
              Manage Time Wisely
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              Prioritize tasks to balance learning and life:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-400">
              <li>Create a daily to-do list with study tasks.</li>
              <li>Focus on one topic at a time.</li>
              <li>Study complex topics in your peak energy hours.</li>
            </ul>
          </div>

          {/* Schedule Time */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              Suggested Study Schedule
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              A static weekly plan to guide your learning. Adapt it to your needs!
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                    <th className="p-3 border-b-2 border-blue-300">Day</th>
                    <th className="p-3 border-b-2 border-blue-300">Morning (9 AM - 12 PM)</th>
                    <th className="p-3 border-b-2 border-blue-300">Afternoon (1 PM - 5 PM)</th>
                    <th className="p-3 border-b-2 border-blue-300">Evening (6 PM - 9 PM)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="p-3 border-b border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 font-medium">Monday</td>
                    <td className="p-3 border-b border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">HTML Basics</td>
                    <td className="p-3 border-b border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">CSS Syntax</td>
                    <td className="p-3 border-b border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">Review Notes</td>
                  </tr>
                  <tr className="bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <td className="p-3 border-b border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 font-medium">Tuesday</td>
                    <td className="p-3 border-b border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">Flexbox Layout</td>
                    <td className="p-3 border-b border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">Responsive Design</td>
                    <td className="p-3 border-b border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">Practice CSS</td>
                  </tr>
                  <tr className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="p-3 border-b border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 font-medium">Wednesday</td>
                    <td className="p-3 border-b border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">JavaScript Variables</td>
                    <td className="p-3 border-b border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">Functions</td>
                    <td className="p-3 border-b border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">Community Chat</td>
                  </tr>
                  <tr className="bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <td className="p-3 border-b border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 font-medium">Thursday</td>
                    <td className="p-3 border-b border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">Events Handling</td>
                    <td className="p-3 border-b border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">Coding Practice</td>
                    <td className="p-3 border-b border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">Tutor Call</td>
                  </tr>
                  <tr className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="p-3 border-b border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 font-medium">Friday</td>
                    <td className="p-3 border-b border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">Project Planning</td>
                    <td className="p-3 border-b border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">Build Project</td>
                    <td className="p-3 border-b border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">Review Week</td>
                  </tr>
                  <tr className="bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <td className="p-3 border-b border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 font-medium">Saturday</td>
                    <td className="p-3 border-b border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">Rest</td>
                    <td className="p-3 border-b border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">Light Revision</td>
                    <td className="p-3 border-b border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">Optional Practice</td>
                  </tr>
                  <tr className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="p-3 border-b border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 font-medium">Sunday</td>
                    <td className="p-3 border-b border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">Rest</td>
                    <td className="p-3 border-b border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">Plan Next Week</td>
                    <td className="p-3 border-b border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">Relax</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningPathPage;