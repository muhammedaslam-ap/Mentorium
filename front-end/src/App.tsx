import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { Toaster } from "sonner";

import { store } from "./redux/store";

import AuthForm from "./pages/authForm";
import { NotFound } from "./pages/404pageNotFound";
import Index from "./pages/student/home";
import { TutorHome } from "./pages/tutor/home";
import AdminLogin from "./pages/admin/login/login";
import AdminDashboard from "./pages/admin/dashboard/dashboard";
import StudentsManagement from "./pages/admin/students/page";
import TutorsManagement from "./pages/admin/tutors/page";
import TutorCourses from "./pages/tutor/courses/courses";
import AddCourse from "./pages/tutor/courses/add-course";
import EditCourse from "./pages/tutor/courses/edit-course";
import TutorProfilePage from "./pages/tutor/profile/page";
import StudentProfilePage from "./pages/student/profile/profile";
import CourseLessons from "./pages/tutor/courses/lessons/lesson";
import AddLesson from "./pages/tutor/courses/lessons/lesson";
import EditLesson from "./pages/tutor/courses/lessons/lesson";
import { PublicUserRoute } from "@/private/user/publicUserRoute";
import {
  ProtectedTutorRoute,
  ProtectedAdminRoute,
  ProtectedUserRoute,
} from "@/private/user/protectedUserRoute";
import CourseDetails from "./pages/student/courses/courseID/courseID";
import AllCoursesPage from "./pages/student/courses/page";
import AddQuizPage from "./pages/tutor/courses/lessons/quiz/add-quiz";
import EditQuizPage from "./pages/tutor/courses/lessons/quiz/edit-quiz";
import WishlistPage from "./pages/student/wishlist/wishlist";
import CourseEnrollPage from "./pages/student/checkOut/checkOut";
import EnrolledCourses from "./pages/student/courses/enrolledCourses/enrolledCourses";
import { CommunityChat } from "./pages/student/communityChat/communityChat";
import WalletPage from "./pages/tutor/wallet/wallet";
import { MessagesPage } from "./pages/tutor/privateChat/privateChat";
import { PrivateChat } from "./pages/student/privateChat/privateChat";
import { VideoCall } from "./components/videoCall/video";
import { CallNotification } from "./components/videoCall/callNotification";
import { AppProvider } from "./provider/AppProvider";
import PurchaseHistoryPage from "./pages/student/purchase-History/purchase";

function App() {
  return (
    <div>
      <Toaster richColors position="top-right" toastOptions={{ className: "text-sm p-0" }} />
      <Provider store={store}>
        <AppProvider>
        <Router>
          <CallNotification />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route
              path="/auth"
              element={
                <PublicUserRoute>
                  <AuthForm />
                </PublicUserRoute>
              }
            />
            <Route path="/video-call/:roomId" element={<VideoCall />} />
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
              path="/student/purchase-History"
              element={
                <ProtectedUserRoute>
                  <PurchaseHistoryPage />
                </ProtectedUserRoute>
              }
            />
            <Route
              key="user-community"
              path="/community"
              element={
                <ProtectedUserRoute>
                  <CommunityChat />
                </ProtectedUserRoute>
              }
            />
            <Route
              key="student-chat"
              path="/student/:courseId/chat"
              element={
                <ProtectedUserRoute>
                  <PrivateChat />
                </ProtectedUserRoute>
              }
            />
            <Route path="/student/courses" element={<AllCoursesPage />} />
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
              path="/tutor/wallet"
              element={
                <ProtectedTutorRoute>
                  <WalletPage />
                </ProtectedTutorRoute>
              }
            />
            <Route
              path="/tutor/chat"
              element={
                <ProtectedTutorRoute>
                  <MessagesPage />
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
            {/* Lesson Management Routes */}
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
            {/* Quiz Management Routes */}
            <Route
              path="/tutor/courses/:courseId/lessons/quiz/add"
              element={
                <ProtectedTutorRoute>
                  <AddQuizPage />
                </ProtectedTutorRoute>
              }
            />
            <Route
              path="/tutor/courses/:courseId/lessons/quiz/edit/:quizId"
              element={
                <ProtectedTutorRoute>
                  <EditQuizPage />
                </ProtectedTutorRoute>
              }
            />
            {/* Admin Routes */}
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
            {/* Tutor Profile Route */}
            <Route
              path="/tutor/profile"
              element={
                <ProtectedTutorRoute>
                  <TutorProfilePage />
                </ProtectedTutorRoute>
              }
            />
            {/* Catch-all route for 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        </AppProvider>
      </Provider>
    </div>
  );
}

export default App;