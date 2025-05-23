import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Provider } from "react-redux"
import { Toaster } from "sonner"

import { store } from "./redux/store"

import AuthForm from "./pages/authForm"
import { NotFound } from "./pages/404pageNotFound"
import Index from "./pages/student/home" 
import TutorHome from "./pages/tutor/home"
import AdminLogin from "./pages/admin/login/login"
import AdminDashboard from "./pages/admin/dashboard/dashboard"
import StudentsManagement from "./pages/admin/students/page"
import TutorsManagement from "./pages/admin/tutors/page"
import TutorCourses from "./pages/tutor/courses/courses"
import AddCourse from "./pages/tutor/courses/add-course"
import EditCourse from "./pages/tutor/courses/edit-course"
import TutorProfilePage from "./pages/tutor/profile/page"
import StudentProfilePage from "./pages/student/profile/profile"

import CourseLessons from "./pages/tutor/courses/lessons/lesson"
import AddLesson from "./pages/tutor/courses/lessons/lesson"
import EditLesson from "./pages/tutor/courses/lessons/lesson"

import { PublicUserRoute } from "@/private/user/publicUserRoute"
import { ProtectedTutorRoute, ProtectedAdminRoute, ProtectedUserRoute } from "@/private/user/protectedUserRoute"
import CourseDetails from "./pages/student/courses/courseID/courseID"
import AllCoursesPage from "./pages/student/courses/page"
import AddQuizPage from "./pages/tutor/courses/lessons/quiz/add-quiz"
import EditQuizPage from "./pages/tutor/courses/lessons/quiz/edit-quiz"
import WishlistPage from "./pages/student/wishlist/wishlist"
import CourseEnrollPage from "./pages/student/checkOut/checkOut"
import EnrolledCourses from "./pages/student/courses/enrolledCourses/enrolledCourses"
import { CommunityChat } from "./pages/student/communityChat/communityChat"

function App() {
  return (
    <>
      <Toaster richColors position="top-right" toastOptions={{ className: "text-sm p-0" }} />

      <Provider store={store}>
        <Router>
          <Routes>
            {/* User routes */}
            <Route path="/" element={<Index />} />
            <Route
              path="/auth"
              element={
                <PublicUserRoute>
                  <AuthForm />
                </PublicUserRoute>
              }
            />
            <Route
              path="/tutor/home"
              element={
                <ProtectedTutorRoute>
                  <TutorHome />
                </ProtectedTutorRoute>
              }
            />

            {/* Student routes */}
            <Route
              path="/student/home"
              element={
                <ProtectedUserRoute>
                  <Index />
                </ProtectedUserRoute>
              }
            />
            <Route
              path="/student/profile"
              element={
                <ProtectedUserRoute>
                  <StudentProfilePage />
                </ProtectedUserRoute>
              }
            />
              <Route
              key="user-community"
              path="/community"
              element={
                <ProtectedUserRoute>
                  {/* <ErrorBoundary> */}
                    <CommunityChat />
                  {/* </ErrorBoundary> */}
                </ProtectedUserRoute>
              }
            />,
              <Route
              path="/student/courses"
              element={
                <ProtectedUserRoute>
                  <AllCoursesPage />
                </ProtectedUserRoute>
              }
            />
            <Route
              path="/student/courses/:courseId"
              element={
                <ProtectedUserRoute>
                  <CourseDetails />
                </ProtectedUserRoute>
              }
            />

            <Route
              path="/student/checkout/:courseId"
              element={
                <ProtectedUserRoute>
                  <CourseEnrollPage />
                </ProtectedUserRoute>
              }
            />

            <Route
              path="/student/wishlist"
              element={
                <ProtectedUserRoute>
                  <WishlistPage />
                </ProtectedUserRoute>
              }
            />

             <Route
              path="/student/enrolled"
              element={
                <ProtectedUserRoute>
                  <EnrolledCourses />
                </ProtectedUserRoute>
              }
            />


            {/* Tutor routes */}
            <Route
              path="/tutor/courses"
              element={
                <ProtectedTutorRoute>
                  <TutorCourses />
                </ProtectedTutorRoute>
              }
            />
            <Route
              path="/tutor/courses/add"
              element={
                <ProtectedTutorRoute>
                  <AddCourse />
                </ProtectedTutorRoute>
              }
            />
            <Route
              path="/tutor/courses/edit/:courseId"
              element={
                <ProtectedTutorRoute>
                  <EditCourse />
                </ProtectedTutorRoute>
              }
            />

            {/* New Lesson Management Routes */}
            <Route
              path="/tutor/courses/:courseId/lessons"
              element={
                <ProtectedTutorRoute>
                  <CourseLessons />
                </ProtectedTutorRoute>
              }
            />
            <Route
              path="/tutor/courses/:courseId/lessons/add"
              element={
                <ProtectedTutorRoute>
                  <AddLesson />
                </ProtectedTutorRoute>
              }
            />
            <Route
              path="/tutor/courses/:courseId/lessons/edit/:lessonId"
              element={
                <ProtectedTutorRoute>
                  <EditLesson />
                </ProtectedTutorRoute>
              }
            />

            <Route
              path="/tutor/profile"
              element={
                <ProtectedTutorRoute>
                  <TutorProfilePage />
                </ProtectedTutorRoute>
              }
            />

             <Route
              path="/tutor/courses/lessons/quiz/add/:lessonId"
              element={
                <ProtectedTutorRoute>
                  <AddQuizPage />
                </ProtectedTutorRoute>
              }
            />
            <Route
              path="/tutor/courses/lessons/quiz/edit/:quizId"
              element={
                <ProtectedTutorRoute>
                  <EditQuizPage />
                </ProtectedTutorRoute>
              }
            />

            {/* Admin routes */}
            <Route
              path="/admin/login"
              element={
                <PublicUserRoute>
                  <AdminLogin />
                </PublicUserRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedAdminRoute>
                  <AdminDashboard />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/students"
              element={
                <ProtectedAdminRoute>
                  <StudentsManagement />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/tutors"
              element={
                <ProtectedAdminRoute>
                  <TutorsManagement />
                </ProtectedAdminRoute>
              }
            />

            {/* Catch all - Not Found page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </Provider>
    </>
  )
}

export default App
