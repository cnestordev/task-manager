import { Avatar, Box, HStack, Spacer, Text } from "@chakra-ui/react";
import { formatDistanceToNow } from "date-fns";
import { useImageContext } from "../context/ImageContext";
import { useUser } from "../context/UserContext";

const CommentItem = ({ comment, handleRemoveComment }) => {
  const { images } = useImageContext();
  const { user } = useUser();

  const username = comment.createdBy?.username || "Unknown User";
  const createdAt = comment.createdAt
    ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })
    : "just now";

  const userId = comment.createdBy?._id;
  const userImage = images[userId];
  const isImageLoaded =
    userImage && userImage.complete && userImage.naturalWidth !== 0;

  const avatarSrc = isImageLoaded ? userImage.src : "/default-avatar.png";

  return (
    <Box
      p={3}
      borderWidth="1px"
      borderRadius="md"
      bg="gray.50"
      _dark={{ bg: "gray.700" }}
    >
      <HStack fontSize="sm" color="gray.600">
        <Avatar key={comment._id} src={avatarSrc} size="sm" />
        <Text>
          <strong>By:</strong> {username}
        </Text>
        <Spacer />
        <Text>{createdAt}</Text>
      </HStack>

      <Text mt={2} fontSize="sm">
        {comment.text}
      </Text>

      {user?.id === comment?.createdBy?._id && (
        <Text
          mt={2}
          color="red.500"
          fontSize="sm"
          cursor="pointer"
          _hover={{ textDecoration: "underline" }}
          onClick={() => handleRemoveComment?.(comment)}
        >
          Delete
        </Text>
      )}
    </Box>
  );
};

export default CommentItem;
