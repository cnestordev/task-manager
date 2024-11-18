import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
} from "@chakra-ui/react";
import { WarningIcon } from "@chakra-ui/icons";
import { useRef } from "react";
import { useUser } from "../context/UserContext";

const DeleteTaskModal = ({ isOpen, onClose, taskTitle, handleRemoveTask }) => {
  const deleteRef = useRef();
  const { user } = useUser();

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={deleteRef}
      onClose={onClose}
      size="xl"
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            <WarningIcon /> Delete Task
          </AlertDialogHeader>

          <AlertDialogBody>
            <p>Are you sure you want to delete this task?</p>
            <p>{taskTitle}</p>
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button
              className={`input-border cancel-btn ${user?.darkMode ? "dark" : ""}`}
              ref={deleteRef}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button className="delete-btn" colorScheme="red" onClick={handleRemoveTask} ml={3}>
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};

export default DeleteTaskModal;
