import {
  Box,
  Button,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import axiosImageUpload from "../services/axiosImages";

export const UploadModal = ({ children, userId }) => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    return () => {
      console.log("CLOSED")
    }
  }, [])

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
    formData.append("userId", userId);

    try {
      setIsUploading(true);
      const response = await axiosImageUpload.post(
        "/auth/uploadImage",
        formData
      );
      setIsUploading(false);
      setFile(null)
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
      setFile(null)
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
    <Popover>
      <PopoverTrigger>{children}</PopoverTrigger>
      <PopoverContent>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader>Upload Avatar</PopoverHeader>
        <PopoverBody>
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
              p={6}
              textAlign="center"
              cursor="pointer"
              _hover={{ bg: "gray.50" }}
              mb={4}
            >
              {file ? "Image selected: " + file.name : "Click to upload image"}
            </Box>
          </label>
          <Box display="flex" justifyContent="center">
            <Button
              colorScheme="blue"
              onClick={handleUpload}
              isLoading={isUploading}
              loadingText="Uploading"
              disabled={!file}
            >
              Upload
            </Button>
          </Box>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};
