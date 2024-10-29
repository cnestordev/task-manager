import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import TaskBoard from "./components/TaskBoard";
import { useUser } from "./context/UserContext";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  const { user, loading } = useUser();

  if (loading) {
    return <div>Loading...</div>; 
  }

  return (
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

        {/* Default Route: Redirect based on user status */}
        <Route
          path="/"
          element={
            user ? <Navigate to="/taskboard" /> : <Navigate to="/login" />
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
