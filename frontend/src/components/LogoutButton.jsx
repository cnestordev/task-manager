import { Button } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { logout as logoutApi } from "../api/auth";
import { useUser } from "../context/UserContext";

const LogoutButton = () => {
  const { logout } = useUser();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // 1. Log out from the server
      await logoutApi();

      // 2. Clear the user state on the client
      logout();

      // 3. Redirect to the login page
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <Button className="logout-btn" onClick={handleLogout} colorScheme="red">
      Logout
    </Button>
  );
};

export default LogoutButton;
