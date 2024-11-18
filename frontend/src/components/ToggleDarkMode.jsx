import { Box, Button, Icon, Spinner } from "@chakra-ui/react";
import { useCallback, useRef, useState } from "react";
import { MdDarkMode, MdSunny, MdCheck, MdError } from "react-icons/md";
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
  const [status, setStatus] = useState("idle"); // "idle", "loading", "success", "error"
  const isTogglingRef = useRef(false);

  // Debounced toggle handler
  const handleToggle = useCallback(
    debounce(async () => {
      if (isTogglingRef.current) return;
      isTogglingRef.current = true;
      setStatus("loading"); // Set to loading state when request starts
      try {
        const data = await axiosInstance.get("/auth/toggleDarkMode");
        const darkModeSetting = data.data.darkMode || false;
        updateUser({
          ...user,
          darkMode: darkModeSetting,
        });
        setStatus("success"); // Set to success state on successful request

        // Reset to idle after 2 seconds
        setTimeout(() => {
          setStatus("idle");
          isTogglingRef.current = false;
        }, 2000);
      } catch (error) {
        console.error("Failed to toggle dark mode:", error);
        setStatus("error"); // Set to error state if request fails

        // Reset to idle after 2 seconds
        setTimeout(() => {
          setStatus("idle");
          isTogglingRef.current = false;
        }, 2000);
      }
    }, 500),
    [user]
  );

  return (
    <Box onClick={handleToggle} display="flex" alignContent="center">
      <Box>
        {status === "loading" ? (
          <Spinner color="#d1bc07" />
        ) : status === "success" ? (
          <Icon className="darkmode-toggle" color="green" as={MdCheck} />
        ) : status === "error" ? (
          <Icon className="darkmode-toggle" color="red" as={MdError} />
        ) : (
          <Icon
            color="#d1bc07"
            className="darkmode-toggle"
            as={darkMode ? MdSunny : MdDarkMode}
          />
        )}
      </Box>
    </Box>
  );
};
