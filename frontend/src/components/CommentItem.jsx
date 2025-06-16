import { Avatar, Box, HStack, Spacer, Text } from "@chakra-ui/react";
import { formatDistanceToNow } from "date-fns";
import { useImageContext } from "../context/ImageContext";

const CommentItem = ({ comment }) => {
  const { images } = useImageContext();

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
    </Box>
  );
};

export default CommentItem;