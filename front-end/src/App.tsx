import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider, useSelector } from "react-redux";
import { Toaster } from "sonner";

import { RootState, store } from "./redux/store";

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
import OutgoingVideocallPage from "./pages/tutor/videoCall/outGoingCall";
import IncomingVideocallPage from "./pages/student/videoCall/incomingCall";
import TutorIncomingVideocall from "./pages/tutor/videoCall/incomingCall";
import VideoCallPage from "./pages/student/videoCall/videoCall";
import { AppProvider } from "./provider/AppProvider";
import PurchaseHistoryPage from "./pages/student/purchase-History/purchase";
import TutorProfile from "./pages/student/tutor/tutorProfile";
import { SocketContextProvider } from "./provider/socket";
import TrainerVideoCall from "./pages/tutor/videoCall/outGoingCall"; // Ensure this path matches
import AdminWalletPage from "./pages/admin/wallet/page";
import LearningPathPage from "./pages/student/learningPath";
import AboutPage from "./pages/student/about";
import TutorCallHistory from "./pages/tutor/videoCall/callVideo";
import StudentCallHistory from "./pages/student/videoCall/callHistory";

function VideoCallHandler() {
  const { videoCall, showVideoCallTrainer, showIncomingCallTrainer } = useSelector(
    (state: RootState) => state.tutor
  );
  const { showIncomingVideoCall, showVideoCallUser } = useSelector(
    (state: RootState) => state.user
  );

  return (
    <>
      {videoCall && <OutgoingVideocallPage />}
      {showIncomingVideoCall?._id && <IncomingVideocallPage />}
      {showIncomingCallTrainer && <TutorIncomingVideocall />} 
      {showVideoCallTrainer && <TrainerVideoCall />} 
      {showVideoCallUser && <VideoCallPage />}
    </>
  );
}

function App() {
  return (
    <div>
      <Toaster
        richColors
        position="top-right"
        toastOptions={{ className: "text-sm p-0" }}
      />

      <Provider store={store}>
        <SocketContextProvider>
          <AppProvider>
            <Router>
              <VideoCallHandler />
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
                <Route
                  path="/paths"
                  element={
                    // <PublicUserRoute>
                      <LearningPathPage />
                    // </PublicUserRoute>
                  }
                />

                <Route
                  path="/about"
                  element={
                    // <PublicUserRoute>
                      <AboutPage />
                    // </PublicUserRoute>
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
                <Route
                  path="/tutor/callHistory"
                  element={
                    <ProtectedTutorRoute>
                      <TutorCallHistory />
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
                  path="/student/callHistory"
                  element={
                    <ProtectedUserRoute>
                      <StudentCallHistory />
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
                  path="/student/tutor/:tutorId"
                  element={
                    <ProtectedUserRoute>
                      <TutorProfile />
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
                  path="/admin/wallet"
                  element={
                    <ProtectedAdminRoute>
                      <AdminWalletPage />
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
        </SocketContextProvider>
      </Provider>
    </div>
  );
}

export default App;