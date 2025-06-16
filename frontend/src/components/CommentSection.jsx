import { Button, Divider, Input, Text, VStack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { addCommentToTask } from "../api";
import { useComments } from "../context/CommentContext";
import CommentItem from "./CommentItem";

const CommentSection = ({ taskId }) => {
  const [commentText, setCommentText] = useState("");
  const { commentsByTaskId, fetchComments, addComment } = useComments();

  const comments = commentsByTaskId[taskId] || [];

  useEffect(() => {
    if (taskId) {
      fetchComments(taskId);
    }
  }, [taskId]);

  const handleSubmit = async () => {
    if (commentText.trim()) {
      try {
        const { data } = await addCommentToTask({
          taskId,
          text: commentText.trim(),
        });

        addComment(taskId, data.data);
        setCommentText("");
      } catch (err) {
        console.error("Failed to add comment:", err);
      }
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
        onClick={handleSubmit}
        isDisabled={!commentText.trim()}
      >
        Post Comment
      </Button>
    </>
  );
};

export default CommentSection;
