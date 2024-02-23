import './App.css';
import Dashboard from './modules/Dashboard';
import Form from './modules/Form';
import { Route, Routes, Navigate } from "react-router-dom";

function App() {
  const isLoggedIn = localStorage.getItem("token");

  // Redirect jika belum login
  const ProtectedRoute = ({ children }) => {
    if (!isLoggedIn) {
      return <Navigate to="/users/login" />;
    }
    return children;
  };

  // Redirect jika sudah login
  const AuthRoute = ({ children }) => {
    if (isLoggedIn) {
      return <Navigate to="/" />;
    }
    return children;
  };

  return (
    <Routes>
      <Route
        path="/"
        element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
      />
      <Route
        path="/users/login"
        element={<AuthRoute><Form isLoginPage={true} /></AuthRoute>}
      />
      <Route
        path="/users/register"
        element={<AuthRoute><Form isLoginPage={false} /></AuthRoute>}
      />
    </Routes>
  );
}

export default App;
