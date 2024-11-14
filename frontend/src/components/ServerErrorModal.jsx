import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
} from "@chakra-ui/react";

export const ServerErrorModal = ()  => {
  return (
    <Modal
      isOpen={true}
      onClose={() => {}}
      closeOnOverlayClick={false}
      closeOnEsc={false}
      isCentered
    >
      <ModalOverlay />
      <ModalContent bg="red.600" color="white">
        <ModalHeader>Connection Error</ModalHeader>
        <ModalBody>
          Unable to connect to the server. Please check your internet connection
          or try again later.
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
