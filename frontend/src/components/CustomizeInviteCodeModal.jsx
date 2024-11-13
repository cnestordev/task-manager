import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useColorMode,
  useDisclosure,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";

const CustomizeInviteCodeModal = ({ currentCode, onSave }) => {
  const { user } = useUser();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [inviteCode, setInviteCode] = useState(currentCode || "");
  const [isValid, setIsValid] = useState(false);
  
  const darkMode = user?.darkMode || false;
  const { colorMode, setColorMode } = useColorMode();

  useEffect(() => {
    setColorMode(darkMode ? "dark" : "light");
  }, [darkMode, setColorMode]);

  const handleChange = (event) => {
    const newCode = event.target.value;
    setInviteCode(newCode);

    // Check if input is exactly 8 alphanumeric characters
    const codeRegex = /^[a-zA-Z0-9]{8}$/;
    setIsValid(codeRegex.test(newCode));
  };

  const handleSave = () => {
    onSave(inviteCode);
    onClose();
  };

  return (
    <>
      <Button onClick={onOpen} colorScheme="blue" size="sm">
        Edit Invite Code
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Customize Your Invite Code</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl isRequired>
              <FormLabel>Invite Code (8 Alphanumeric Characters)</FormLabel>
              <Input
                value={inviteCode}
                onChange={handleChange}
                placeholder="Enter new invite code"
                maxLength={8}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={onClose} mr={3}>
              Cancel
            </Button>
            <Button
              colorScheme="teal"
              onClick={handleSave}
              isDisabled={!isValid}
            >
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default CustomizeInviteCodeModal;
