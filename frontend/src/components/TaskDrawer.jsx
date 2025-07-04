import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Text,
  Button,
  Flex,
} from "@chakra-ui/react";
import CommentSection from "./CommentSection";

export const TaskDrawer = ({
  isOpen,
  onClose,
  task,
  addNewComment,
  removeComment,
  editTask,
  completedTask,
  deleteTask,
}) => {
  if (!task) return null;

  return (
    <Drawer isOpen={isOpen} placement="right" size="md" onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader textAlign="center">{task.title}</DrawerHeader>

        <DrawerBody>
          <Text fontWeight="bold" mb={2}>
            {task.priority}
          </Text>
          <Text mb={4}>{task.description}</Text>

          <CommentSection
            addNewComment={addNewComment}
            removeComment={removeComment}
            taskId={task._id}
          />
        </DrawerBody>

        <DrawerFooter>
          <Flex gap={4} justifyContent="center" width="100%">
            <Button colorScheme="blue" onClick={() => editTask(task)}>
              Edit
            </Button>
            <Button
              colorScheme={task.isCompleted ? "yellow" : "green"}
              onClick={() => completedTask(task)}
            >
              {task.isCompleted ? "Restore" : "Complete"}
            </Button>
            <Button colorScheme="red" onClick={() => deleteTask(task)}>
              Delete
            </Button>
          </Flex>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
