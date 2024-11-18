import { useState } from "react";
import { Button, VStack, Text } from "@chakra-ui/react";
import CreateTeamDashboard from "./CreateTeamDashboard";
import JoinTeamDashboard from "./JoinTeamDashboard";
import { useUser } from "../context/UserContext";

export const NewTeamContainer = () => {
  const [isCreatingTeam, setIsCreatingTeam] = useState(true);
  const { user } = useUser();

  const toggleDashboard = () => {
    setIsCreatingTeam(!isCreatingTeam);
  };

  return (
    <VStack
      spacing={6}
      align="center"
      width="100%"
      maxW="400px"
      mx="auto"
      p={4}
    >
      {isCreatingTeam ? <CreateTeamDashboard /> : <JoinTeamDashboard />}

      <Button
        className={`input-border color-btn ${user?.darkMode ? "dark" : ""}`}
        variant="link"
        colorScheme="blue"
        onClick={toggleDashboard}
        mt={4}
      >
        {isCreatingTeam
          ? "Have an invite code? Join team."
          : "Want to create your own team?"}
      </Button>
    </VStack>
  );
};
