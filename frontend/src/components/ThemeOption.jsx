import { Box, Icon } from "@chakra-ui/react";
import { MdCheck, MdError } from "react-icons/md";
import "./ThemeOption.css";
import { useUser } from "../context/UserContext";

// Light and dark colors for each theme
const themeColors = {
  blueTheme: { light: "#c9f2ff", dark: "#162029" },
  onyxTheme: { light: "#e9e9e9", dark: "#2a2a2a" },
  purpleTheme: { light: "#dac4f9", dark: "#261e39" },
  greenTheme: { light: "#c8f7da", dark: "#172623" },
};

export const ThemeOption = ({ themeName, status, onClick }) => {
  const { light, dark } = themeColors[themeName];
  const { user } = useUser();
  const darkMode = user?.darkMode || false;
  const theme = user?.theme || "blueTheme"; // Current active theme

  // Background color based on status, active theme, and dark mode
  const isActiveTheme = theme === themeName;
  const backgroundColor = isActiveTheme
    ? darkMode
      ? dark
      : light
    : status === "success" || status === "error"
    ? darkMode
      ? dark
      : light
    : `linear-gradient(to right, ${light} 50%, ${dark} 50%)`;

  return (
    <Box
      as="button"
      onClick={() => onClick(themeName)}
      width="25px"
      height="25px"
      borderRadius="50%"
      background={backgroundColor}
      position="relative"
      display="flex"
      alignItems="center"
      justifyContent="center"
      overflow="hidden"
      border="2px solid #ccc"
      className={`${status === "loading" ? "loading-icon" : ""}`}
      transition="background 0.2s ease"
    >
      {status === "success" ? (
        <Icon color="green" as={MdCheck} boxSize={4} />
      ) : status === "error" ? (
        <Icon color="red" as={MdError} boxSize={4} />
      ) : null}
    </Box>
  );
};
