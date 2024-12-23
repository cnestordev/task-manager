import {
  Avatar,
  AvatarBadge,
  Button,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  useDisclosure,
  useToast,
  Box,
  Text,
} from "@chakra-ui/react";
import { SettingsIcon } from '@chakra-ui/icons'
import { useUser } from "../context/UserContext";
import LogoutButton from "./LogoutButton";
import { ToggleDarkMode } from "./ToggleDarkMode";
import { useSocketContext } from "../context/SocketContext";
import { useEffect, useState } from "react";
import axiosImageUpload from "../services/axiosImages";
import "./UserModal.css";
import { ThemeToggler } from "./ThemeToggler";

export const UserModal = () => {
  const { onOpen, onClose, isOpen } = useDisclosure();
  const { user, updateUser } = useUser();
  const { connectedUsers: contextConnectedUsers } = useSocketContext();
  const [connectedUsers, setConnectedUsers] = useState(contextConnectedUsers);
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const toast = useToast();
  const darkMode = user?.darkMode || false;

  // Update `connectedUsers` state whenever the context value changes
  useEffect(() => {
    setConnectedUsers(contextConnectedUsers);
  }, [contextConnectedUsers]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (
      selectedFile &&
      !["image/jpeg", "image/jpg", "image/gif"].includes(selectedFile.type)
    ) {
      toast({
        title: "Invalid file type.",
        description: "Please upload a JPG, JPEG, or GIF image.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      setFile(null);
    } else {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected.",
        description: "Please choose an image to upload.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const formData = new FormData();
    formData.append("image", file);
    formData.append("userId", user.id || user._id);

    try {
      setIsUploading(true);
      const response = await axiosImageUpload.post(
        "/auth/uploadImage",
        formData
      );
      const updatedUser = response.data.user;
      updateUser(updatedUser);
      setIsUploading(false);
      setFile(null);
      toast({
        title: "Upload successful.",
        description: "Your avatar has been uploaded successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onClose();
    } catch (error) {
      setIsUploading(false);
      console.error("Error uploading avatar:", error);
      setFile(null);
      toast({
        title: "Upload failed.",
        description:
          "There was an error uploading your avatar. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Popover
      isOpen={isOpen}
      onOpen={onOpen}
      onClose={onClose}
      placement="bottom"
      closeOnBlur={true}
    >
      <PopoverTrigger>
        <Avatar
          src={user?.avatarUrl}
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
      </PopoverTrigger>

      <PopoverContent>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader justifyContent="center" display="flex" alignItems="center" gap={2}>
          <SettingsIcon />
          <Text as="h4">User Settings</Text>
        </PopoverHeader>
        <PopoverBody>
          {/* Upload section */}
          <Box
            className={`upload-modal ${darkMode ? "dark" : ""}`}
            mb={8}
            mt={4}
          >
            <input
              id="file-input"
              type="file"
              accept=".jpg, .jpeg, .gif"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
            <label htmlFor="file-input">
              <Box
                border="2px dashed gray"
                borderRadius="md"
                p={4}
                textAlign="center"
                cursor="pointer"
                mb={2}
              >
                {file
                  ? "Image selected: " + file.name
                  : "Click to upload image"}
              </Box>
            </label>
            <Button
              colorScheme="blue"
              onClick={handleUpload}
              isLoading={isUploading}
              loadingText="Uploading"
              disabled={!file}
              width="full"
            >
              Upload
            </Button>
          </Box>
          <Box display="flex" justifyContent="space-around">
            <ToggleDarkMode />
            <ThemeToggler />
          </Box>
          <Box display="flex" justifyContent="space-around" mt={5}>
            <LogoutButton size={["sm", "sm"]} />
          </Box>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};
