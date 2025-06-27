import { Button, Divider, Input, Text, VStack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useComments } from "../context/CommentContext";
import CommentItem from "./CommentItem";
import { useSocketContext } from "../context/SocketContext";

const CommentSection = ({ taskId, addNewComment }) => {
  const [commentText, setCommentText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { commentsByTaskId, fetchComments } = useComments();
  const { notifyCommentCreated } = useSocketContext();

  const comments = commentsByTaskId[taskId] || [];

  useEffect(() => {
    if (taskId) {
      fetchComments(taskId);
    }
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
      setIsLoading(false); // remove spinner regardless of success/failure
    }
  };

  return (
    <>
      <Divider mb={4} />
      <Text borderBottom="1px solid gray" pb={5} fontWeight="bold" mb={2}>
        Comments
      </Text>

      <VStack align="stretch" spacing={3} mb={4} overflowY="auto">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <CommentItem key={comment._id} comment={comment} />
          ))
        ) : (
          <Text>No comments yet.</Text>
        )}
      </VStack>

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
    </>
  );
};

export default CommentSection;
