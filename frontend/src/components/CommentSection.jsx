import {
  Button,
  Divider,
  Input,
  Text,
  VStack,
  Flex,
  Box,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useComments } from "../context/CommentContext";
import CommentItem from "./CommentItem";
import { useSocketContext } from "../context/SocketContext";

const CommentSection = ({ taskId, addNewComment, removeComment }) => {
  const [commentText, setCommentText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { commentsByTaskId, fetchComments } = useComments();
  const { notifyCommentCreated, notifyCommentDeleted } = useSocketContext();

  const comments = commentsByTaskId[taskId] || [];

  useEffect(() => {
    if (!taskId) return;

    // Initial fetch
    fetchComments(taskId);

    // Set up polling
    const interval = setInterval(() => {
      fetchComments(taskId);
    }, 30000); // every 30 seconds

    // Cleanup
    return () => {
      clearInterval(interval);
    };
  }, [taskId]);

  const handleAddComment = async () => {
    setIsLoading(true);
    try {
      const newComment = await addNewComment(commentText);
      notifyCommentCreated(newComment);
      setCommentText("");
    } catch (err) {
      console.error("Failed to add comment", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveComment = async (comment) => {
    try {
      const removedComment = await removeComment(comment);
      notifyCommentDeleted(removedComment);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Flex direction="column" h="90%">
      <Box>
        <Divider mb={4} />
        <Text borderBottom="1px solid gray" pb={5} fontWeight="bold" mb={2}>
          Comments
        </Text>
      </Box>

      {/* Scrollable area */}
      <Box flex="1" overflowY="auto" mb={4}>
        <VStack align="stretch" spacing={3}>
          {comments.length > 0 ? (
            comments.map((comment) => (
              <CommentItem
                handleRemoveComment={handleRemoveComment}
                key={comment?._id}
                comment={comment}
              />
            ))
          ) : (
            <Text>No comments yet.</Text>
          )}
        </VStack>
      </Box>

      {/* Bottom input area */}
      <Box>
        <Input
          placeholder="Add a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          mb={2}
        />
        <Button
          colorScheme="blue"
          onClick={handleAddComment}
          isDisabled={!commentText.trim()}
          isLoading={isLoading}
          loadingText="Posting"
        >
          Post Comment
        </Button>
      </Box>
    </Flex>
  );
};

export default CommentSection;
