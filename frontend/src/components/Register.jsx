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
  const buttonBg = useColorModeValue("teal.500", "teal.400");
  const buttonHoverBg = useColorModeValue("teal.600", "teal.500");

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
      const errorMessage =
        error.response && error.response.status === 400
          ? error.response.data.error
          : "An error occurred during registration";

      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
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
        isDemoUser: true,
      };
      handleRegistration(registrationData);
    } catch (err) {
      console.error("Error with registering user", err);
    }
  };

  const handleClick = () => setShowPrimary(!showPrimary);
  const handleClickConfirmation = () => setShowSecondary(!showSecondary);

  return (
    <Box
      maxWidth="400px"
      mx="auto"
      mt="100px"
      p="6"
      bg={bgColor}
      color={textColor}
      boxShadow="lg"
      borderRadius="xl"
    >
      <Heading mb="6" textAlign="center" fontSize="2xl" fontWeight="bold">
        Register
      </Heading>
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
        colorScheme="teal"
        alignSelf="center"
        size="sm"
      >
        Create Random User
      </Button>
      <form onSubmit={handleSubmit(handleRegistration)}>
        <VStack spacing="6">
          <FormControl isInvalid={!!errors.username} isRequired>
            <FormLabel htmlFor="username" fontWeight="medium">
              Username
            </FormLabel>
            <Input
              id="username"
              placeholder="Enter a username"
              {...register("username")}
              bg={colorMode === "dark" ? "gray.700" : "white"}
              focusBorderColor="teal.500"
              borderRadius="md"
            />
            <FormErrorMessage>{errors.username?.message}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={!!errors.password} isRequired>
            <FormLabel htmlFor="password" fontWeight="medium">
              Password
            </FormLabel>
            <InputGroup>
              <Input
                type={showPrimary ? "text" : "password"}
                id="password"
                placeholder="Enter your password"
                {...register("password")}
                bg={colorMode === "dark" ? "gray.700" : "white"}
                focusBorderColor="teal.500"
                borderRadius="md"
              />
              <InputRightElement width="4.5rem">
                <Button
                  h="1.75rem"
                  size="sm"
                  onClick={handleClick}
                  bg="transparent"
                >
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
            <FormLabel htmlFor="confirmPassword" fontWeight="medium">
              Confirm Password
            </FormLabel>
            <InputGroup>
              <Input
                type={showSecondary ? "text" : "password"}
                id="confirmPassword"
                placeholder="Confirm your password"
                {...register("confirmPassword")}
                bg={colorMode === "dark" ? "gray.700" : "white"}
                focusBorderColor="teal.500"
                borderRadius="md"
              />
              <InputRightElement width="4.5rem">
                <Button
                  h="1.75rem"
                  size="sm"
                  onClick={handleClickConfirmation}
                  bg="transparent"
                >
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
            borderRadius="md"
            transition="all 0.2s"
          >
            Register
          </Button>
        </VStack>
      </form>
      <Text mt="6" textAlign="center" fontSize="sm" color="gray.500">
        Already have an account?{" "}
        <Link as={RouterLink} to="/login" color="teal.500" fontWeight="bold">
          Login here
        </Link>
      </Text>
    </Box>
  );
};

export default Register;
