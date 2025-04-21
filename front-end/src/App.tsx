import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthForm from './pages/authForm';
import { NotFound } from './pages/404pageNotFound';
import { UserHomePage } from './pages/student/home';

import { Provider } from 'react-redux';
import { store } from './redux/store';

import { PublicUserRoute } from '@/private/user/publicUserRoute';
import { ProtectedUserRoute } from '@/private/user/protectedUserroute';



function App() {
  return (
    <>
      <Provider store={store}>
        <Router>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedUserRoute>
                  <UserHomePage />
                </ProtectedUserRoute>
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

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </Provider>
    </>
  );
}

export default App;
