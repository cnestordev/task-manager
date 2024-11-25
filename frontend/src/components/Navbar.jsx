import { Box, Container, Heading, Stack, Text } from "@chakra-ui/react";
import { useUser } from "../context/UserContext";
import { useLocation } from "react-router-dom";
import "./Navbar.css";
import SettingsButton from "./SettingsButton";
import { UserModal } from "./UserModal";
import FormContainer from "./FormContainer";
import { useEffect, useState } from "react";

const Navbar = ({ dashboardFunction }) => {
  const { user } = useUser();
  const [darkMode, setDarkMode] = useState(user?.darkMode);

  // Get the current location
  const location = useLocation();

  useEffect(() => {
    setDarkMode(user?.darkMode);
  }, [user?.darkMode]);

  return (
    <Container
      mb={2}
      maxWidth="initial"
      className={`navbar-container ${darkMode ? "dark" : ""}`}
    >
      <Stack
        direction={["column", "row"]}
        alignItems="center"
        justifyContent={["center", "space-between"]}
        spacing={4}
        className="navbar-user-container"
        width="100%"
      >
        {/* Avatar and Greeting Section */}
        <Stack direction="row" alignItems="center" spacing={3}>
          <Box ml={3} display="flex" flexDirection="column" alignItems="center">
            <Text
              className="greeting-text"
              margin="0"
              fontSize={["sm", "medium"]}
            >
              Hello,
            </Text>
            <Heading
              className="greeting-name"
              margin="0"
              fontSize={["2xl", "3xl"]}
            >
              {user?.username}
            </Heading>
          </Box>
        </Stack>

        {/* Buttons Section */}
        <Stack
          direction={["row"]}
          spacing={4}
          alignItems="center"
          justifyContent="center"
        >
          <SettingsButton size={["sm", "md"]} />

          {location.pathname === "/taskboard" && (
            <FormContainer addTask={dashboardFunction} />
          )}
        </Stack>

        <Stack
          flexDirection="row"
          alignItems="center"
          justify="center"
          align="center"
          cursor="pointer"
        >
          <UserModal />
        </Stack>
      </Stack>
    </Container>
  );
};

export default Navbar;
