import { Avatar, Box, Container, Heading, Stack, Text } from "@chakra-ui/react";
import { useUser } from "../context/UserContext";
import LogoutButton from "./LogoutButton";
import "./Navbar.css";
import SettingsButton from "./SettingsButton";
import { UploadModal } from "./UploadModal";
import { getCloudinaryAvatarUrl } from "../utils/getCloudinaryAvatarUrl";

const Navbar = ({ children }) => {
  const { user } = useUser();
  const cloudinaryUrl = getCloudinaryAvatarUrl(user?.id || user?._id);

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
          <UploadModal userId={user.id || user._id}>
            <Avatar
              src={cloudinaryUrl}
              color="#ebedf0"
              bg="#c2c7d0"
              name={user?.username}
            />
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
        <Stack justify="center" align="center">
          <LogoutButton size={["sm", "sm"]} />
        </Stack>
      </Stack>
    </Container>
  );
};

export default Navbar;
