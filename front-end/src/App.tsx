import { useState } from 'react'
import Login from './pages/login';
import Signup from './pages/signup';


function App() {
  const [isLogin, setIsLogin] = useState<boolean>(true);

  return (
    <>
      <div>
      {isLogin ? (
        <Login onSwitchToSignup={() => setIsLogin(false)} />
      ) : (
        <Signup onSwitchToLogin={() => setIsLogin(true)} />
      )}
    </div>
    </>
  )
}

export default App
