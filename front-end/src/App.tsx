import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthForm from './pages/authForm';
import { NotFound } from './pages/404pageNotFound';
import { UserHomePage } from './pages/student/home';
import { Toaster } from "sonner";
import { Provider } from 'react-redux';
import { store } from './redux/store';

import { PublicUserRoute } from '@/private/user/publicUserRoute';
import TutorHome from './pages/tutor/home';
import { ProtectedUserRoute } from '@/private/user/protectedUserRoute';



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
            <Route
              path="/"
              element={
                
                  <UserHomePage />
              }
            />        
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
                <ProtectedUserRoute>
                  <TutorHome />
               </ProtectedUserRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </Provider>
    </>
  );
}

export default App;
