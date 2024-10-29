import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Text,
  useToast,
  FormErrorMessage,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { createTeam } from "../api";

const TeamSchema = Yup.object().shape({
  teamName: Yup.string()
    .required("Team name is required")
    .min(3, "Team name must be at least 3 characters long"),
});

const CreateTeamDashboard = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  // React Hook Form setup with Yup validation
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(TeamSchema),
    mode: "onBlur",
  });

  // Handle form submission
  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const response = await createTeam(data.teamName);

      toast({
        title: "Team Created",
        description: `Team "${response.data.name}" created successfully! Invite code: ${response.data.inviteCode}`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      reset();
    } catch (err) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Error creating team",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxW="md" mx="auto" p={6} boxShadow="lg" borderRadius="md" bg="white">
      <Text fontSize="2xl" fontWeight="bold" mb={4} textAlign="center">
        Create Your Team
      </Text>

      <form onSubmit={handleSubmit(onSubmit)}>
        <FormControl isInvalid={errors.teamName} isRequired>
          <FormLabel htmlFor="teamName">Team Name</FormLabel>
          <Input
            id="teamName"
            placeholder="Enter your team name"
            {...register("teamName")}
          />
          <FormErrorMessage>{errors.teamName?.message}</FormErrorMessage>
        </FormControl>

        <Button
          colorScheme="blue"
          type="submit"
          isLoading={loading}
          loadingText="Creating Team"
          mt={4}
        >
          Create Team
        </Button>
      </form>
    </Box>
  );
};

export default CreateTeamDashboard;
