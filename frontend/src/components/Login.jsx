import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Heading,
  VStack,
  Text,
  Link,
  FormErrorMessage,
  useToast,
  InputGroup,
  InputRightElement,
  Icon,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";
import { useUser } from "../context/UserContext";
import { login } from "../api";
import { LoginSchema } from "../validation/userValidation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { ViewIcon, ViewOffIcon, MoonIcon, SunIcon } from "@chakra-ui/icons";
import { useEffect, useState } from "react";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { login: loginUser } = useUser();
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
    resolver: yupResolver(LoginSchema),
    mode: "onBlur",
  });

  useEffect(() => {
    const darkModeMediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)"
    );

    // Set color mode based on the user's preference
    setColorMode(darkModeMediaQuery.matches ? "dark" : "light");

    // Listen for changes in the system color scheme preference
    darkModeMediaQuery.addEventListener("change", (e) => {
      setColorMode(e.matches ? "dark" : "light");
    });

    // Cleanup event listener on unmount
    return () =>
      darkModeMediaQuery.removeEventListener("change", (e) => {
        setColorMode(e.matches ? "dark" : "light");
      });
  }, [setColorMode]);

  const handleLogin = async (data) => {
    const { username, password } = data;

    try {
      const { data } = await login(username, password);

      if (data.statusCode === 200 && data.user) {
        loginUser(data.user);
        navigate("/taskboard");
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Login Failed",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      console.log(error);
    }
    reset();
    setShowPassword(false);
  };

  const handlePasswordToggle = () => setShowPassword(!showPassword);

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
      <Heading mb="6">Login</Heading>
      <Button
        onClick={toggleColorMode}
        mb="4"
        variant="ghost"
        alignSelf="flex-end"
      >
        {colorMode === "dark" ? <SunIcon /> : <MoonIcon />}
      </Button>
      <form onSubmit={handleSubmit(handleLogin)}>
        <VStack spacing="4">
          <FormControl isRequired isInvalid={errors.username}>
            <FormLabel htmlFor="username">Username</FormLabel>
            <Input
              id="username"
              placeholder="Enter your username"
              {...register("username")}
              bg={colorMode === "dark" ? "gray.700" : "white"}
            />
            <FormErrorMessage>{errors.username?.message}</FormErrorMessage>
          </FormControl>
          <FormControl isRequired isInvalid={errors.password}>
            <FormLabel htmlFor="password">Password</FormLabel>
            <InputGroup>
              <Input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Enter your password"
                {...register("password")}
                bg={colorMode === "dark" ? "gray.700" : "white"}
              />
              <InputRightElement width="4.5rem">
                <Button h="1.75rem" size="sm" onClick={handlePasswordToggle}>
                  {showPassword ? (
                    <Icon as={ViewOffIcon} />
                  ) : (
                    <Icon as={ViewIcon} />
                  )}
                </Button>
              </InputRightElement>
            </InputGroup>
            <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
          </FormControl>
          <Button
            type="submit"
            bg={buttonBg}
            _hover={{ bg: buttonHoverBg }}
            color="white"
            width="full"
          >
            Login
          </Button>
        </VStack>
      </form>

      <Text mt="4" textAlign="center">
        Don&#39;t have an account?{" "}
        <Link as={RouterLink} to="/register" color="teal.500">
          Register here
        </Link>
      </Text>
    </Box>
  );
};

export default Login;
