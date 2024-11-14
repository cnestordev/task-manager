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
} from "@chakra-ui/react";
import { useUser } from "../context/UserContext";
import LogoutButton from "./LogoutButton";
import { ToggleDarkMode } from "./ToggleDarkMode";
import { getCloudinaryAvatarUrl } from "../utils/getCloudinaryAvatarUrl";
import { useSocketContext } from "../context/SocketContext";
import { useEffect, useState } from "react";
import axiosImageUpload from "../services/axiosImages";
import "./UserModal.css"

export const UserModal = ({ comp }) => {
  const { onOpen, onClose, isOpen } = useDisclosure();
  const { user } = useUser();
  const { connectedUsers: contextConnectedUsers } = useSocketContext();
  const cloudinaryUrl = getCloudinaryAvatarUrl(user?.id || user?._id);
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
      setIsUploading(false);
      setFile(null);
      toast({
        title: "Upload successful.",
        description: "Your avatar has been uploaded successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
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
      closeOnBlur={false}
    >
      <PopoverTrigger>
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
      </PopoverTrigger>

      <PopoverContent>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader>User Settings</PopoverHeader>
        <PopoverBody>
          {/* Upload section */}
          <Box className={`upload-modal ${darkMode ? "dark" : ""}`} mb={8} mt={4}>
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
            <LogoutButton size={["sm", "sm"]} />
          </Box>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};
