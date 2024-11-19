import { Container, useColorMode } from "@chakra-ui/react";
import { useUser } from "../context/UserContext";
import { useEffect } from "react";
import { ServerErrorModal } from "./ServerErrorModal";

export const MainContainer = ({ serverHealthy, children }) => {
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
    <>
      {!serverHealthy && <ServerErrorModal />}
      <Container
        maxWidth="100%"
        padding={{ base: "10px", md: "40px" }}
        height={{ base: "auto", md: "100vh" }}
        className={`container ${colorMode === "dark" ? "dark" : ""}`}
      >
        {children}
      </Container>
    </>
  );
};
