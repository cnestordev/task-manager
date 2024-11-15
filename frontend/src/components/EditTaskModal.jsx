import {
  Avatar,
  Box,
  Button,
  Collapse,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  ListIcon,
  ListItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  Textarea,
  UnorderedList,
} from "@chakra-ui/react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { MdCheckCircle } from "react-icons/md";
import { useUser } from "../context/UserContext";
import { getListOfUsers } from "../utils/userUtils";
import { TaskSchema } from "../validation/taskValidation";

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
  const [addedUsers, setAddedUsers] = useState([...selectedTask.assignedTo]);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const { user } = useUser();
  const darkMode = user?.darkMode || false;

  useEffect(() => {
    // Fetch users when the modal opens
    const fetchUsers = async () => {
      try {
        const users = await getListOfUsers();
        if (users) setUsersList(users);
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

  // color variables based on darkMode
  const assignedBgColor = darkMode ? "blue.800" : "blue.50";
  const addedBgColor = darkMode ? "green.800" : "green.50";
  const defaultBgColor = darkMode ? "#2d3748" : "white";
  const textColor = darkMode ? "white" : "black";
  const borderBottomColor = darkMode ? "#4a5568" : "#e2e8f0";
  const assignedIconColor = darkMode ? "blue.300" : "blue.500";
  const addedIconColor = darkMode ? "green.300" : "green.500";

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent bg={defaultBgColor} color={textColor}>
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
                bg={defaultBgColor}
                color={textColor}
                borderColor={borderBottomColor}
              />
              <FormErrorMessage>{errors.title?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={errors.description} isRequired mt={4}>
              <FormLabel>Description</FormLabel>
              <Textarea
                id="description"
                placeholder="Edit task description"
                {...register("description")}
                bg={defaultBgColor}
                color={textColor}
                borderColor={borderBottomColor}
              />
              <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
            </FormControl>

            {/* Toggle to assign users */}
            <Button mt={4} onClick={() => setIsOptionsOpen(!isOptionsOpen)}>
              Assign Users
            </Button>
            <Collapse in={isOptionsOpen} animateOpacity>
              <Box
                p={4}
                mt={4}
                shadow="md"
                borderWidth="1px"
                borderRadius="md"
                bg={defaultBgColor}
                color={textColor}
              >
                <UnorderedList
                  display="flex"
                  alignItems="center"
                  gap={2}
                  styleType="none"
                >
                  {usersList.length > 0 ? (
                    usersList.map((user) => {
                      const isAssigned = selectedTask.assignedTo.includes(
                        user._id
                      ); // Check if user is in assignedTo
                      const isAdded = addedUsers.includes(user._id); // Check if user is in addedUsers
                      return (
                        <ListItem
                          cursor="pointer"
                          key={user._id}
                          p={3}
                          bg={
                            isAssigned
                              ? assignedBgColor
                              : isAdded
                              ? addedBgColor
                              : defaultBgColor
                          }
                          color={textColor}
                          border={!isAdded ? !isAssigned ? "1px solid #e7e7e7" : "1px solid transparent" : "none"}
                          borderRadius="50px"
                          onClick={() =>
                            !isAssigned && handleSelectedUser(user)
                          }
                        >
                          <Box display="flex" alignItems="center">
                            <Avatar src={user.avatarUrl} size="xs" />
                            <Text w={50}>{user.username}</Text>
                            {isAssigned ? (
                              <ListIcon
                                as={MdCheckCircle}
                                color={assignedIconColor}
                              />
                            ) : (
                              isAdded && (
                                <ListIcon
                                  as={MdCheckCircle}
                                  color={addedIconColor}
                                />
                              )
                            )}
                          </Box>
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
