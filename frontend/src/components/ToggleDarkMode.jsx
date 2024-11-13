import { Box, Icon } from "@chakra-ui/react";
import { useCallback } from "react";
import { MdDarkMode, MdSunny } from "react-icons/md";
import { useUser } from "../context/UserContext";
import axiosInstance from "../services/axiosInstance";
import "./ToggleDarkMode.css";

// Utility function for debouncing
const debounce = (func, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

export const ToggleDarkMode = () => {
  const { user, updateUser } = useUser();
  const darkMode = user?.darkMode || false;

  // Debounced toggle handler
  const handleToggle = useCallback(
    debounce(async () => {
      try {
        const data = await axiosInstance.get("/auth/toggleDarkMode");
        const darkModeSetting = data.data.darkMode || false;
        updateUser({
          ...user,
          darkMode: darkModeSetting,
        });
      } catch (error) {
        console.error("Failed to toggle dark mode:", error);
      }
    }, 500),
    [user]
  );

  return (
    <Box onClick={handleToggle} display="flex" alignContent="center">
      <Icon
        color="#918200"
        className="darkmode-toggle"
        as={darkMode ? MdSunny : MdDarkMode}
      />
    </Box>
  );
};
