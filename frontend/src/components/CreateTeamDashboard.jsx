import { useState } from "react";
import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { createTeam } from "../api";
import { useUser } from "../context/UserContext";
import { TeamSchema } from "../validation/teamValidation";

const CreateTeamDashboard = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const { user, updateUser } = useUser();
  const darkMode = user?.darkMode || false;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(TeamSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const response = await createTeam(data.teamName);

      toast({
        title: "Team Created",
        description: `Team "${response.data.team.name}" created successfully! Invite code: ${response.data.team.inviteCode}`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      reset();

      // Update the user context
      updateUser({
        ...response.data.user,
        team: response.data.team,
      });
    } catch (err) {
      const errorMessage = err.response.data.error;
      toast({
        title: "Error",
        description: errorMessage || "Error creating team",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <VStack
      spacing={6}
      align="center"
      width="100%"
      maxW="400px"
      margin="0 auto"
      padding="2rem 1rem"
    >
      <Text mb={4} fontSize="2xl" fontWeight="medium" color="gray.700">
        Create Your Team
      </Text>

      <form onSubmit={handleSubmit(onSubmit)} style={{ width: "100%" }}>
        <FormControl
          isDisabled={user.isDemoUser}
          isInvalid={errors.teamName}
          isRequired
          marginBottom="1rem"
        >
          <FormLabel htmlFor="teamName" fontWeight="medium" color="gray.600">
            Team Name
          </FormLabel>
          <Input
            className={`input-border ${user?.darkMode ? "dark" : ""}`}
            id="teamName"
            placeholder="Enter your team name"
            borderRadius="md"
            _placeholder={{
              color: darkMode ? "whiteAlpha.700" : "gray.500",
            }}
            {...register("teamName")}
          />

          <FormErrorMessage>{errors.teamName?.message}</FormErrorMessage>
        </FormControl>

        <Button
          className={`input-border color-btn ${user?.darkMode ? "dark" : ""}`}
          type="submit"
          isLoading={loading}
          loadingText="Creating Team"
          width="100%"
          marginTop="1.5rem"
          borderRadius="md"
          isDisabled={user.isDemoUser}
        >
          Create Team
        </Button>
        <Text hidden={!user.isDemoUser} mt={3} color="red.500">
          Demo user unable to create new team
        </Text>
      </form>
    </VStack>
  );
};

export default CreateTeamDashboard;
