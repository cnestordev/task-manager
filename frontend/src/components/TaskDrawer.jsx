import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Text,
} from "@chakra-ui/react";
import CommentSection from "./CommentSection";

export const TaskDrawer = ({
  isOpen,
  onClose,
  task,
  addNewComment,
  removeComment,
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

        <DrawerFooter />
      </DrawerContent>
    </Drawer>
  );
};
