import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { Toaster } from "sonner";

import { store } from "./redux/store";

import AuthForm from "./pages/authForm";
import { NotFound } from "./pages/404pageNotFound";
import { UserHomePage } from "./pages/student/home";
import TutorHome from "./pages/tutor/home";
import AdminLogin from "./pages/admin/login/login";
import AdminDashboard from "./pages/admin/dashboard/dashboard";
import StudentsManagement from "./pages/admin/students/page";
import TutorsManagement from "./pages/admin/tutors/page";
import TutorCourses from "./pages/tutor/courses/courses";
import AddCourse from "./pages/tutor/courses/add-course";
import EditCourse from "./pages/tutor/courses/edit-course";

import { PublicUserRoute } from "@/private/user/publicUserRoute";
import { ProtectedTutorRoute } from "@/private/user/protectedUserRoute";
import { ProtectedAdminRoute } from "@/private/user/protectedUserRoute";
import TutorProfilePage from "./pages/tutor/profile/page";

function App() {
  return (
    <>
      <Toaster
        richColors
        position="top-right"
        toastOptions={{ className: "text-sm p-0" }}
      />

      <Provider store={store}>
        <Router>
          <Routes>
            {/* User routes */}
            <Route path="/" element={<UserHomePage />} />
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

            <Route
              path="/tutor/profile"
              element={
                <ProtectedTutorRoute>
                  <TutorProfilePage />
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
  );
}

export default App;