import { useEffect, useState } from "react";
import {
  Avatar,
  AvatarBadge,
  Box,
  Container,
  Heading,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useUser } from "../context/UserContext";
import LogoutButton from "./LogoutButton";
import "./Navbar.css";
import SettingsButton from "./SettingsButton";
import { UploadModal } from "./UploadModal";
import { getCloudinaryAvatarUrl } from "../utils/getCloudinaryAvatarUrl";
import { useSocketContext } from "../context/SocketContext";
import { ToggleDarkMode } from "./ToggleDarkMode";

const Navbar = ({ children }) => {
  const { user } = useUser();
  const cloudinaryUrl = getCloudinaryAvatarUrl(user?.id || user?._id);
  const { connectedUsers: contextConnectedUsers } = useSocketContext();
  const [connectedUsers, setConnectedUsers] = useState(contextConnectedUsers);
  const darkMode = user?.darkMode || false;

  // Update `connectedUsers` state whenever the context value changes
  useEffect(() => {
    setConnectedUsers(contextConnectedUsers);
  }, [contextConnectedUsers]);

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
          <UploadModal userId={user.id || user._id}>
            <Avatar
              src={cloudinaryUrl}
              color="#ebedf0"
              bg="#c2c7d0"
              name={user?.username}
            >
              <AvatarBadge
                boxSize="1em"
                bg={
                  connectedUsers.includes(user?.id || user?._id)
                    ? "green.500"
                    : "gray.500"
                }
              />
            </Avatar>
          </UploadModal>
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
        <Stack
          flexDirection="row"
          alignItems="center"
          justify="center"
          align="center"
        >
          <ToggleDarkMode />
          <LogoutButton size={["sm", "sm"]} />
        </Stack>
      </Stack>
    </Container>
  );
};

export default Navbar;
