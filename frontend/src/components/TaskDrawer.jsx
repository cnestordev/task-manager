import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
} from "@chakra-ui/react";

export const TaskDrawer = ({ isOpen, onClose, task }) => {
  if (!task) return null; // don't render if there's no task

  return (
    <Drawer isOpen={isOpen} placement="right" size="md" onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader textAlign="center">{task.title}</DrawerHeader>

        <h3>{task.priority}</h3>

        <DrawerBody>
          <p>{task.description}</p>
        </DrawerBody>

        <DrawerFooter>
          {/* Add footer */}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
