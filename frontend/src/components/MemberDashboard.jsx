import {
  Avatar,
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  Spinner,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { getTeamDetails, removeMember } from "../api";
import { useUser } from "../context/UserContext";

const MemberDashboard = () => {
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const { user, updateUser } = useUser();
  const darkMode = user?.darkMode || false;

  useEffect(() => {
    const fetchTeamDetails = async () => {
      try {
        const data = await getTeamDetails();
        setTeam(data);
      } catch (error) {
        const errorMessage = error.response.data.error;
        toast({
          title: "Error",
          description: errorMessage,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchTeamDetails();
  }, [toast]);

  const handleLeaveTeam = async () => {
    try {
      await removeMember(user._id || user.id);
      toast({
        title: "Left Team",
        description: "You have successfully left the team.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      updateUser({
        ...user,
        team: null,
      });
    } catch (error) {
      const errorMessage = error.response.data.error;
      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (loading) return <Spinner size="xl" color="blue.500" />;

  return (
    <Box mx="auto" width={["100%", "50%"]} borderRadius="md">
      <Heading
        as="h2"
        size="lg"
        mb={6}
        textAlign="center"
        color={darkMode ? "white" : "gray.700"}
      >
        Member Dashboard
      </Heading>

      {/* Team Information */}
      {team ? (
        <Box
          p={4}
          borderRadius="20"
          padding="35px"
          className={`card-item ${darkMode ? "dark" : ""}`}
          mb={6}
          textAlign="center"
          display="flex"
          alignItems="center"
          flexDirection="column"
        >
          <Text
            fontSize="lg"
            fontWeight="bold"
            color={darkMode ? "gray.200" : "gray.800"}
          >
            Team Name: {team.name}
          </Text>
          <Button
            colorScheme="red"
            variant="outline"
            mt={4}
            onClick={handleLeaveTeam}
          >
            Leave Team
          </Button>
        </Box>
      ) : (
        <Text color={darkMode ? "gray.400" : "gray.600"}>
          No team information available
        </Text>
      )}

      {/* Team Members */}
      <Box>
        <Text
          fontSize="lg"
          fontWeight="bold"
          mb={4}
          color={darkMode ? "gray.200" : "gray.700"}
        >
          Team Members
        </Text>
        {team && team.members && team.members.length > 0 ? (
          <VStack spacing={4} align="stretch">
            {team.members.map((member) => {
              // Check if team.assets and the specific member's avatar URL exist
              const cloudinaryUrl = user?.team?.assets?.[member._id] || "/default-avatar.png";
              return (
                <Flex
                  key={member._id}
                  alignItems="center"
                  p={3}
                  className={`card-item ${darkMode ? "dark" : ""}`}
                  borderRadius="20"
                  padding="20px"
                  width="100%"
                  alignSelf="center"
                >
                  <Box
                    gap="3"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Avatar src={cloudinaryUrl} />
                    <Text
                      flex="1"
                      color={darkMode ? "gray.200" : "gray.800"}
                      fontWeight="medium"
                    >
                      {member.username}{" "}
                      {member._id === team.createdBy && (
                        <Badge colorScheme="purple">Admin</Badge>
                      )}
                    </Text>
                  </Box>
                </Flex>
              );
            })}
          </VStack>
        ) : (
          <Text color={darkMode ? "gray.400" : "gray.600"}>
            No members in the team
          </Text>
        )}
      </Box>
    </Box>
  );
};

export default MemberDashboard;
