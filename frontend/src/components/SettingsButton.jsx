import { Button } from "@chakra-ui/react";
import { useNavigate, useLocation } from "react-router-dom";

const SettingsButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isDashboard = location.pathname === "/dashboard";
  const nextPath = isDashboard ? "/taskboard" : "/dashboard";
  const buttonLabel = isDashboard ? "Go to Taskboard" : "Go to Dashboard";

  const handleNavigate = () => {
    navigate(nextPath);
  };

  return (
    <Button
      className="navbar-btns"
      onClick={handleNavigate}
      colorScheme="blue"
      aria-label={buttonLabel}
    >
      {buttonLabel}
    </Button>
  );
};

export default SettingsButton;
