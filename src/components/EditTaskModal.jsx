import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  FormErrorMessage,
  Textarea,
  Box,
  UnorderedList,
  ListItem,
  ListIcon,
  Collapse,
} from "@chakra-ui/react";
import { MdCheckCircle } from "react-icons/md";
import { TaskSchema } from "../validation/taskValidation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { getListOfUsers } from "../utils/userUtils";

const EditTaskModal = ({ isOpen, onClose, saveTaskChanges, selectedTask }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(TaskSchema),
    mode: "onBlur",
    defaultValues: {
      title: selectedTask?.title || "",
      description: selectedTask?.description || "",
    },
  });

  const [usersList, setUsersList] = useState([]);
  const [addedUsers, setAddedUsers] = useState([]);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);

  useEffect(() => {
    // Fetch users when the modal opens
    const fetchUsers = async () => {
      try {
        const users = await getListOfUsers();
        setUsersList(users);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };
    fetchUsers();

    // Load assigned users when a task is selected
    if (selectedTask) {
      reset({
        title: selectedTask.title,
        description: selectedTask.description,
      });
      setAddedUsers(selectedTask.addedUsers || []);
    }
  }, [selectedTask, reset]);

  const handleSelectedUser = (selectedUser) => {
    setAddedUsers((prevList) => {
      const isUserInList = prevList.includes(selectedUser._id);
      return isUserInList
        ? prevList.filter((userId) => userId !== selectedUser._id)
        : [...prevList, selectedUser._id];
    });
  };

  const onSubmit = async (data) => {
    data.addedUsers = [...addedUsers];
    await saveTaskChanges(data, reset);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>Edit Task</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl isInvalid={errors.title} isRequired>
              <FormLabel>Title</FormLabel>
              <Input
                id="title"
                placeholder="Edit task title"
                {...register("title")}
              />
              <FormErrorMessage>{errors.title?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={errors.description} isRequired mt={4}>
              <FormLabel>Description</FormLabel>
              <Textarea
                id="description"
                placeholder="Edit task description"
                {...register("description")}
              />
              <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
            </FormControl>

            {/* Toggle to assign users */}
            <Button mt={4} onClick={() => setIsOptionsOpen(!isOptionsOpen)}>
              Assign Users
            </Button>
            <Collapse in={isOptionsOpen} animateOpacity>
              <Box p={4} mt={4} shadow="md" borderWidth="1px" borderRadius="md">
                <UnorderedList styleType="none" spacing={3}>
                  {usersList.length > 0 ? (
                    usersList.map((user) => {
                      const isAdded = addedUsers.some(
                        (addedUser) => addedUser._id === user._id
                      );
                      return (
                        <ListItem
                          key={user._id}
                          p={2}
                          _hover={{ bg: "gray.100", cursor: "pointer" }}
                          borderBottom="1px solid #e2e8f0"
                          _last={{ borderBottom: "none" }}
                          onClick={() => handleSelectedUser(user)}
                        >
                          {user.username}
                          {isAdded && (
                            <ListIcon as={MdCheckCircle} color="green.500" />
                          )}
                        </ListItem>
                      );
                    })
                  ) : (
                    <ListItem>No users found.</ListItem>
                  )}
                </UnorderedList>
              </Box>
            </Collapse>
          </ModalBody>

          <ModalFooter gap="4">
            <Button onClick={onClose}>Cancel</Button>
            <Button colorScheme="blue" type="submit">
              Save
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default EditTaskModal;
