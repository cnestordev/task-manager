import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { MdCheckCircle } from "react-icons/md";
import { AddIcon } from "@chakra-ui/icons";
import {
  Avatar,
  Box,
  Button,
  Collapse,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  ListIcon,
  ListItem,
  Select,
  Text,
  Textarea,
  UnorderedList,
  useColorMode,
  useDisclosure,
} from "@chakra-ui/react";

import { useUser } from "../context/UserContext";
import { getListOfUsers } from "../utils/userUtils";
import { TaskSchema } from "../validation/taskValidation";

import "./FormContainer.css";

const FormContainer = ({ addTask }) => {
  const { user } = useUser();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef();
  const { isOpen: isOptionsOpen, onToggle } = useDisclosure();
  const [usersList, setUsersList] = useState([]);
  const [addedUsers, setAddedUsers] = useState([]);

  const { setColorMode } = useColorMode();
  const darkMode = user?.darkMode || false;

  useEffect(() => {
    setColorMode(darkMode ? "dark" : "light");
  }, [darkMode, setColorMode]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(TaskSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data) => {
    try {
      data.addedUsers = [...addedUsers];
      await addTask(data);
      reset();
      onClose();
    } catch (error) {
      console.error("Failed to add task:", error);
    }
  };

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
  }, []);

  const handleSelectedUser = (selectedUser) => {
    setAddedUsers((prevList) => {
      const isUserInList = prevList.some(
        (user) => user._id === selectedUser._id
      );
      return isUserInList
        ? prevList.filter((user) => user._id !== selectedUser._id)
        : [...prevList, selectedUser];
    });
  };

  return (
    <>
      <Button
        className={`navbar-btns ${darkMode ? "dark" : ""}`}
        ref={btnRef}
        onClick={onOpen}
      >
        <AddIcon boxSize={3} mr={2} /> Create
      </Button>
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        finalFocusRef={btnRef}
        size="md"
      >
        <DrawerOverlay />
        <DrawerContent borderRadius="30px">
          <DrawerCloseButton />
          <DrawerHeader>Add New Task</DrawerHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <DrawerBody>
              {/* Title Input */}
              <FormControl isInvalid={errors.title} isRequired>
                <FormLabel htmlFor="title">Title:</FormLabel>
                <Input
                  className={`input-border ${darkMode ? "dark" : ""}`}
                  id="title"
                  placeholder="Enter task title"
                  {...register("title")}
                />
                <FormErrorMessage>{errors.title?.message}</FormErrorMessage>
              </FormControl>

              {/* Description Input */}
              <FormControl isInvalid={errors.description} mt={4}>
                <FormLabel htmlFor="description">Description:</FormLabel>
                <Textarea
                  className={`input-border ${darkMode ? "dark" : ""}`}
                  id="description"
                  placeholder="Enter task description"
                  {...register("description")}
                />
                <FormErrorMessage>
                  {errors.description?.message}
                </FormErrorMessage>
              </FormControl>

              {/* Priority Select */}
              <FormControl isInvalid={errors.priority} mt={4} isRequired>
                <FormLabel htmlFor="priority">Priority:</FormLabel>
                <Select
                  className={`input-border ${darkMode ? "dark" : ""}`}
                  id="priority"
                  placeholder="Select priority"
                  {...register("priority")}
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </Select>
                <FormErrorMessage>{errors.priority?.message}</FormErrorMessage>
              </FormControl>

              {/* Assign Users */}
              <Button
                className={`input-border color-btn ${darkMode ? "dark" : ""}`}
                mt={4}
                onClick={onToggle}
              >
                Assign Users
              </Button>
              <Collapse in={isOptionsOpen} animateOpacity>
                <Box
                  mt={4}
                  shadow="md"
                  borderWidth="1px"
                  borderRadius="md"
                >
                  <UnorderedList
                    className={`input-users ${darkMode ? "dark" : ""}`}
                    display="flex"
                    flexWrap="wrap"
                    gap={2}
                    styleType="none"
                    m={0}
                  >
                    {usersList.length > 0 ? (
                      usersList.map((user) => {
                        const isAdded = addedUsers.some(
                          (addedUser) => addedUser._id === user._id
                        );
                        return (
                          <ListItem
                            cursor="pointer"
                            key={user._id}
                            p={2}
                            borderRadius="50px"
                            onClick={() => handleSelectedUser(user)}
                          >
                            <Box display="flex" alignItems="center">
                              <Avatar src={user.avatarUrl} size="sm" />
                              <Text ml={2}>{user.username}</Text>
                              {isAdded && (
                                <ListIcon as={MdCheckCircle} ml={2} />
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
            </DrawerBody>

            <DrawerFooter>
              <Button
                className={`input-border cancel-btn ${darkMode ? "dark" : ""}`}
                variant="outline"
                mr={3}
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                className={`input-border color-btn ${darkMode ? "dark" : ""}`}
                colorScheme="blue"
                type="submit"
              >
                Save Task
              </Button>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default FormContainer;
