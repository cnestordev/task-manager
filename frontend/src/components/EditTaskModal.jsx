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
import "./EditTaskModal.css";

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
    const fetchUsers = async () => {
      try {
        const users = await getListOfUsers();
        if (users) setUsersList(users);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };
    fetchUsers();

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
                className={`input-border ${darkMode ? "dark" : ""}`}
                id="title"
                placeholder="Edit task title"
                {...register("title")}
              />
              <FormErrorMessage>{errors.title?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={errors.description} isRequired mt={4}>
              <FormLabel>Description</FormLabel>
              <Textarea
                className={`input-border ${darkMode ? "dark" : ""}`}
                id="description"
                placeholder="Edit task description"
                {...register("description")}
              />
              <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
            </FormControl>

            <Button
              className={`input-border color-btn ${darkMode ? "dark" : ""}`}
              mt={4}
              onClick={() => setIsOptionsOpen(!isOptionsOpen)}
            >
              Assign Users
            </Button>
            <Collapse in={isOptionsOpen} animateOpacity>
              <Box p={4} mt={4} shadow="md" borderWidth="1px" borderRadius="md">
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
                      );
                      const isAdded = addedUsers.includes(user._id);
                      return (
                        <ListItem
                          cursor="pointer"
                          key={user._id}
                          p={3}
                          border={
                            !isAdded
                              ? !isAssigned
                                ? "1px solid #e7e7e7"
                                : "1px solid transparent"
                              : "none"
                          }
                          borderRadius="50px"
                          onClick={() =>
                            !isAssigned && handleSelectedUser(user)
                          }
                        >
                          <Box display="flex" alignItems="center">
                            <Avatar src={user.avatarUrl} size="xs" />
                            <Text w={50}>{user.username}</Text>
                            {isAssigned || isAdded ? (
                              <ListIcon as={MdCheckCircle} />
                            ) : null}
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
            <Button
              className={`input-border cancel-btn ${darkMode ? "dark" : ""}`}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              className={`input-border color-btn ${darkMode ? "dark" : ""}`}
              type="submit"
            >
              Save
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default EditTaskModal;
