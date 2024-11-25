import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Heading,
  VStack,
  useToast,
  FormErrorMessage,
  InputRightElement,
  InputGroup,
  Icon,
  Text,
  Link,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";
import { useUser } from "../context/UserContext";
import { register as registerUser } from "../api/index";
import { RegistrationSchema } from "../validation/userValidation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState, useEffect } from "react";
import { ViewIcon, ViewOffIcon, SunIcon, MoonIcon } from "@chakra-ui/icons";
import { createRandomUser } from "../utils/createRandomUser";

const Register = () => {
  const [showPrimary, setShowPrimary] = useState(false);
  const [showSecondary, setShowSecondary] = useState(false);
  const { login } = useUser();
  const navigate = useNavigate();
  const toast = useToast();
  const { colorMode, toggleColorMode, setColorMode } = useColorMode();

  // Dynamic colors based on color mode
  const bgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("black", "white");
  const borderColor = useColorModeValue("gray.300", "gray.600");
  const buttonBg = useColorModeValue("green.500", "green.400");
  const buttonHoverBg = useColorModeValue("green.600", "green.500");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(RegistrationSchema),
    mode: "onBlur",
  });

  useEffect(() => {
    const darkModePreference = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    setColorMode(darkModePreference ? "dark" : "light");
  }, [setColorMode]);

  const handleRegistration = async (formData) => {
    const { username, password, isDemoUser = false } = formData;

    try {
      const { data } = await registerUser(username, password, isDemoUser);

      if (data.statusCode === 201 && data.user) {
        login(data.user);
        navigate("/taskboard");
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        toast({
          title: "Error",
          description: "Username already exists",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Error",
          description: "An error occurred during registration",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    }
    reset();
    setShowPrimary(false);
    setShowSecondary(false);
  };

  const handleCreateRandomUser = async () => {
    try {
      const newRandomUser = createRandomUser();
      const registrationData = {
        username: newRandomUser,
        password: "password",
        isDemoUser: true
      };
      handleRegistration(registrationData);
    } catch (err) {
      console.log("Error with registering user", err);
    }
  };

  const handleClick = () => setShowPrimary(!showPrimary);
  const handleClickConfirmation = () => setShowSecondary(!showSecondary);

  return (
    <Box
      maxWidth="400px"
      mx="auto"
      mt="100px"
      p="4"
      bg={bgColor}
      color={textColor}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
    >
      <Heading mb="6">Register</Heading>
      <Button
        onClick={toggleColorMode}
        mb="4"
        variant="ghost"
        alignSelf="flex-end"
      >
        {colorMode === "dark" ? <SunIcon /> : <MoonIcon />}
      </Button>
      <Button
        onClick={handleCreateRandomUser}
        mb="4"
        variant="outline"
        alignSelf="flex-end"
      >
        Create Random User
      </Button>
      <form onSubmit={handleSubmit(handleRegistration)}>
        <VStack spacing="4">
          <FormControl isInvalid={!!errors.username} isRequired>
            <FormLabel htmlFor="username">Username</FormLabel>
            <Input
              id="username"
              placeholder="Enter a username"
              {...register("username")}
              bg={colorMode === "dark" ? "gray.700" : "white"}
            />
            <FormErrorMessage>{errors.username?.message}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={!!errors.password} isRequired>
            <FormLabel htmlFor="password">Password</FormLabel>
            <InputGroup>
              <Input
                type={showPrimary ? "text" : "password"}
                id="password"
                placeholder="Enter your password"
                {...register("password")}
                bg={colorMode === "dark" ? "gray.700" : "white"}
              />
              <InputRightElement width="4.5rem">
                <Button h="1.75rem" size="sm" onClick={handleClick}>
                  {showPrimary ? (
                    <Icon as={ViewOffIcon} />
                  ) : (
                    <Icon as={ViewIcon} />
                  )}
                </Button>
              </InputRightElement>
            </InputGroup>
            <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={!!errors.confirmPassword} isRequired>
            <FormLabel htmlFor="confirmPassword">Confirm Password</FormLabel>
            <InputGroup>
              <Input
                type={showSecondary ? "text" : "password"}
                id="confirmPassword"
                placeholder="Confirm your password"
                {...register("confirmPassword")}
                bg={colorMode === "dark" ? "gray.700" : "white"}
              />
              <InputRightElement width="4.5rem">
                <Button h="1.75rem" size="sm" onClick={handleClickConfirmation}>
                  {showSecondary ? (
                    <Icon as={ViewOffIcon} />
                  ) : (
                    <Icon as={ViewIcon} />
                  )}
                </Button>
              </InputRightElement>
            </InputGroup>
            <FormErrorMessage>
              {errors.confirmPassword?.message}
            </FormErrorMessage>
          </FormControl>
          <Button
            type="submit"
            bg={buttonBg}
            _hover={{ bg: buttonHoverBg }}
            color="white"
            width="full"
          >
            Register
          </Button>
        </VStack>
      </form>
      <Text mt="4" textAlign="center">
        Already have an account?{" "}
        <Link as={RouterLink} to="/login" color="teal.500">
          Login here
        </Link>
      </Text>
    </Box>
  );
};

export default Register;
