import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
} from "@chakra-ui/react";
import { useRef } from "react";
import { useUser } from "../context/UserContext";

const CompletedTaskModal = ({ isOpen, onClose, task, handleCompletedTask }) => {
  const cancelRef = useRef();
  const { user } = useUser();

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
      size="xl"
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            {task.isCompleted ? "Restore" : "Complete"} Task
          </AlertDialogHeader>

          <AlertDialogBody>
            <p>
              {task.isCompleted ? "Restore task?" : "Mark task as completed?"}
            </p>
            <p>{task.title}</p>
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button
              className={`input-border cancel-btn ${user?.darkMode ? "dark" : ""}`}
              ref={cancelRef}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              className={`input-border color-btn ${user?.darkMode ? "dark" : ""}`}
              onClick={handleCompletedTask}
              ml={3}
            >
              Confirm
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};

export default CompletedTaskModal;
