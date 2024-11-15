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
import { checkServerHealth } from "./utils/heathCheck";
import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";

const App = () => {
  const { user, loading } = useUser();
  const [serverHealthy, setServerHealthy] = useState(true);
  const [dashboardFunction, setDashboardFunction] = useState(null);

  useEffect(() => {
    // Perform a health check on app load
    const checkHealth = async () => {
      const isHealthy = await checkServerHealth();
      setServerHealthy(isHealthy);
    };
    checkHealth();

    const fiveMinutesInMs = 300000;
    const interval = setInterval(checkHealth, fiveMinutesInMs);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <MainContainer serverHealthy={serverHealthy}>
      <Router>
        <Navbar dashboardFunction={dashboardFunction} />
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
                <TaskBoard setDashboardFunction={setDashboardFunction} />
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
