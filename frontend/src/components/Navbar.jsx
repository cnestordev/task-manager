import {
  Box,
  Container,
  Heading,
  Stack,
  Text
} from "@chakra-ui/react";
import { useUser } from "../context/UserContext";
import "./Navbar.css";
import SettingsButton from "./SettingsButton";

import { UserModal } from "./UserModal";

const Navbar = ({ children }) => {
  const { user } = useUser();
  const darkMode = user?.darkMode || false;

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
              fontSize={["2xl", "40px"]}
            >
              {user?.username || "Guest"}
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
          {children}
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
