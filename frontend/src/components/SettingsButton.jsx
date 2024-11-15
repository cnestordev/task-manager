import { Button } from "@chakra-ui/react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";

const SettingsButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isDashboard = location.pathname === "/dashboard";
  const nextPath = isDashboard ? "/taskboard" : "/dashboard";
  const buttonLabel = isDashboard ? "Go to Taskboard" : "Go to Dashboard";
  const { user } = useUser();
  const darkMode = user?.darkMode || false;

  const handleNavigate = () => {
    navigate(nextPath);
  };

  return (
    <Button
      className={`navbar-btns ${darkMode ? "dark" : ""}`}
      onClick={handleNavigate}
      aria-label={buttonLabel}
    >
      {buttonLabel}
    </Button>
  );
};

export default SettingsButton;
