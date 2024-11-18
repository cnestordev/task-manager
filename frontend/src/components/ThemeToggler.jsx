import { Box, VStack } from "@chakra-ui/react";
import { useCallback, useRef, useState } from "react";
import { useUser } from "../context/UserContext";
import axiosInstance from "../services/axiosInstance";
import { ThemeOption } from "./ThemeOption";

const debounce = (func, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

const themes = ["blueTheme", "onyxTheme", "purpleTheme", "greenTheme"];

export const ThemeToggler = () => {
  const { user, updateUser } = useUser();
  const [status, setStatus] = useState({});
  const isTogglingRef = useRef({});
  const theme = user?.theme || "blueTheme";

  // Handle theme toggling
  const handleToggle = useCallback(
    debounce(async (themeName) => {
      if (isTogglingRef.current[themeName]) return;
      if (theme === themeName) return;
      isTogglingRef.current[themeName] = true;
      setStatus((prevStatus) => ({ ...prevStatus, [themeName]: "loading" }));

      try {
        const response = await axiosInstance.post("/auth/toggleTheme", {
          theme: themeName,
        });
        const updatedTheme = response.data.theme || themeName;

        updateUser({
          ...user,
          theme: updatedTheme,
        });
        setStatus((prevStatus) => ({ ...prevStatus, [themeName]: "success" }));

        setTimeout(() => {
          setStatus((prevStatus) => ({ ...prevStatus, [themeName]: "idle" }));
          isTogglingRef.current[themeName] = false;
        }, 2000);
      } catch (error) {
        console.error(`Failed to toggle theme ${themeName}:`, error);
        setStatus((prevStatus) => ({ ...prevStatus, [themeName]: "error" }));

        setTimeout(() => {
          setStatus((prevStatus) => ({ ...prevStatus, [themeName]: "idle" }));
          isTogglingRef.current[themeName] = false;
        }, 2000);
      }
    }, 500),
    [user]
  );

  return (
    <VStack spacing={4} flexDirection="row" align="center" gap={5}>
      {themes.map((themeName) => (
        <Box key={themeName}>
          <ThemeOption
            themeName={themeName}
            status={status[themeName] || "idle"}
            onClick={handleToggle}
          />
        </Box>
      ))}
    </VStack>
  );
};
