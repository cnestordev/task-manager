import { Box, Icon } from "@chakra-ui/react";
import { MdCheck, MdError } from "react-icons/md";
import "./ThemeOption.css";
import { useUser } from "../context/UserContext";
import { themeColors } from "../utils/themeColors";
import { THEMES } from "../utils/themeConstants";

export const ThemeOption = ({ themeName, status, onClick }) => {
  // Destructure the light and dark colors for the theme
  const { light, dark } = themeColors[themeName];
  const { user } = useUser();
  const darkMode = user?.darkMode || false;
  const theme = user?.theme || THEMES.BLUE;

  // Determine if this is the active theme and set the background color
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
