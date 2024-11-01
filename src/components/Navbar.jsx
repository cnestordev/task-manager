import { Avatar, Box, Container, Heading, Stack, Text } from "@chakra-ui/react";
import { useUser } from "../context/UserContext";
import LogoutButton from "./LogoutButton";
import "./Navbar.css";
import SettingsButton from "./SettingsButton";

const Navbar = ({ children }) => {
  const { user } = useUser();

  return (
    <Container mb={2} maxWidth="initial" className="navbar-container">
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
          <Avatar color="#ebedf0" bg="#c2c7d0" name={user?.username} />
          <Box textAlign={["center", "left"]}>
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
              fontSize={["2xl", "5xl"]}
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
        <Stack justify="center" align="center">
          <LogoutButton size={["sm", "sm"]} />
        </Stack>
      </Stack>
    </Container>
  );
};

export default Navbar;
