import { Container, useColorMode } from "@chakra-ui/react";
import { useUser } from "../context/UserContext";
import { useEffect } from "react";

export const MainContainer = ({ children }) => {
  const { user } = useUser();
  const { colorMode, setColorMode } = useColorMode();
  const darkMode = user?.darkMode || false;

  useEffect(() => {
    if (!user) {
      // Set color mode based on system preference if no user is logged in
      const darkModePreference = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      setColorMode(darkModePreference ? "dark" : "light");
    } else {
      // Set color mode based on user preference
      setColorMode(darkMode ? "dark" : "light");
    }
  }, [user, setColorMode]);

  return (
    <Container
      maxWidth="100%"
      height={{ base: "auto", md: "100vh" }}
      className={`container ${colorMode === "dark" ? "dark" : ""}`}
    >
      {children}
    </Container>
  );
};
