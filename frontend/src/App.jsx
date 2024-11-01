import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Register from "./components/Register";
import TaskBoard from "./components/TaskBoard";

import { MainContainer } from "./components/MainContainer";
import { useUser } from "./context/UserContext";

const App = () => {
  const { user, loading } = useUser();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <MainContainer>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={user ? <Navigate to="/taskboard" /> : <Login />}
          />
          <Route
            path="/register"
            element={user ? <Navigate to="/taskboard" /> : <Register />}
          />

          {/* Protected Route */}
          <Route
            path="/taskboard"
            element={
              <ProtectedRoute>
                <TaskBoard />
              </ProtectedRoute>
            }
          />

          {/* Protected Route for Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Default Route: Redirect based on user status */}
          <Route
            path="/"
            element={
              user ? <Navigate to="/taskboard" /> : <Navigate to="/login" />
            }
          />
        </Routes>
      </Router>
    </MainContainer>
  );
};

export default App;
