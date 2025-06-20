import { Button, Divider, Input, Text, VStack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useComments } from "../context/CommentContext";
import CommentItem from "./CommentItem";

const CommentSection = ({ taskId, addNewComment }) => {
  const [commentText, setCommentText] = useState("");
  const { commentsByTaskId, fetchComments } = useComments();

  const comments = commentsByTaskId[taskId] || [];

  useEffect(() => {
    if (taskId) {
      fetchComments(taskId);
    }
  }, [taskId]);

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
        onClick={() => addNewComment(commentText)}
        isDisabled={!commentText.trim()}
      >
        Post Comment
      </Button>
    </>
  );
};

export default CommentSection;
