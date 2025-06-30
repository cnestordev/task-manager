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
import { useEffect, useState, useRef } from "react";
import Navbar from "./components/Navbar";

const App = () => {
  const { user, loading, checkUserSession } = useUser();
  const [serverHealthy, setServerHealthy] = useState(true);
  const [dashboardFunction, setDashboardFunction] = useState(null);
  
  // Ref to keep track of the previous server health state
  const prevServerHealthy = useRef(serverHealthy);
  const intervalRef = useRef(null); // Holds current interval ID

  // Perform a health check on app load and periodically
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const isHealthy = await checkServerHealth();
        setServerHealthy(isHealthy);
      } catch (err) {
        console.error("Health check failed:", err);
        setServerHealthy(false);
      }
    };

    // Determine interval duration based on health status
    const intervalDuration = serverHealthy ? 300000 : 30000; // 5 min or 30 sec

    // Run one check immediately
    checkHealth();

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Set new interval
    intervalRef.current = setInterval(checkHealth, intervalDuration);

    // Cleanup on dependency change or unmount
    return () => {
      clearInterval(intervalRef.current);
    };
  }, [serverHealthy]);

  // Reload user data when server recovers
  useEffect(() => {
    if (!prevServerHealthy.current && serverHealthy) {
      checkUserSession();
    }
    prevServerHealthy.current = serverHealthy;
  }, [serverHealthy, checkUserSession]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <MainContainer serverHealthy={serverHealthy}>
      <Router>
        {user && <Navbar dashboardFunction={dashboardFunction} />}
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

          {/* Protected Routes */}
          <Route
            path="/taskboard/:id?"
            element={
              <ProtectedRoute>
                <TaskBoard setDashboardFunction={setDashboardFunction} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Default Redirect */}
          <Route
            path="/"
            element={
              user ? <Navigate to="/taskboard" /> : <Navigate to="/register" />
            }
          />
        </Routes>
      </Router>
    </MainContainer>
  );
};

export default App;
