import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";

const AlertModal = ({ task, isOpen, onClose, onConfirm }) => {
  const handleConfirm = () => {
    console.log("Confirm button clicked");
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      closeOnOverlayClick={false}
      closeOnEsc={false}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{task.title}</ModalHeader>
        <ModalBody>
          {task.isDeleted ? (
            <p>Task has been Deleted.</p>
          ) : task.__v === 0 ? (
            <p>New task has been created.</p>
          ) : (
            <p>Task has been updated. Showing the updated version now.</p>
          )}
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleConfirm}>
            Confirm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AlertModal;
