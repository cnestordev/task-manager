import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  PinInput,
  PinInputField,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { joinTeam } from "../api";
import { useUser } from "../context/UserContext";
import { demoTeamInviteCode } from "../utils/demoTeamConstants";

// Validation schema for invite code
const InviteCodeSchema = Yup.object().shape({
  inviteCode: Yup.string()
    .required("Invite code is required")
    .length(8, "Invite code must be exactly 8 characters"),
});

const JoinTeamDashboard = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const { user, updateUser } = useUser();
  const [isPinComplete, setIsPinComplete] = useState(false);
  const darkMode = user?.darkMode || false;

  const {
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: yupResolver(InviteCodeSchema),
    mode: "onBlur",
    defaultValues: {
      inviteCode: user.isDemoUser ? demoTeamInviteCode : "",
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      setIsPinComplete(true);
      const response = await joinTeam(data.inviteCode);

      toast({
        title: "Joined Team",
        description: response.message,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      reset();
      updateUser({
        ...response.user,
        team: response.team,
      });
    } catch (err) {
      const errorMessage = err.response.data.error;
      toast({
        title: "Error",
        description: errorMessage || "Failed to join team",
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
        Join a Team
      </Text>

      <form style={{ width: "100%" }} onSubmit={handleSubmit(onSubmit)}>
        <FormControl
          isInvalid={errors.inviteCode}
          isRequired
          marginBottom="1rem"
        >
          <FormLabel htmlFor="inviteCode" fontWeight="medium" color="gray.600">
            Invite Code
          </FormLabel>
          <HStack justify="center">
            <PinInput
              isDisabled={user.isDemoUser || isPinComplete}
              type="alphanumeric"
              value={watch("inviteCode") || ""}
              onChange={(value) =>
                setValue("inviteCode", value, { shouldValidate: true })
              }
            >
              {[...Array(8)].map((_, idx) => (
                <PinInputField
                  key={idx}
                  className={`input-border ${user?.darkMode ? "dark" : ""}`}
                  _placeholder={{
                    color: darkMode ? "whiteAlpha.700" : "gray.500",
                  }}
                />
              ))}
            </PinInput>
          </HStack>
          {user.isDemoUser && (
            <Text color="blue.600">
              The invite code has been automatically set for demo users.
            </Text>
          )}

          <FormErrorMessage>{errors.inviteCode?.message}</FormErrorMessage>
        </FormControl>

        <Button
          className={`input-border color-btn ${user?.darkMode ? "dark" : ""}`}
          type="submit"
          isLoading={loading}
          loadingText="Joining Team"
          width="100%"
          marginTop="1.5rem"
          borderRadius="md"
        >
          Join Team
        </Button>
      </form>
    </VStack>
  );
};

export default JoinTeamDashboard;
