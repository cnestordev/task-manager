import { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Text,
  Flex,
  Button,
  useToast,
  Spinner,
  VStack,
  Avatar,
} from "@chakra-ui/react";
import { getTeamDetails, removeMember } from "../api";
import { useUser } from "../context/UserContext";
import { getCloudinaryAvatarUrl } from "../utils/getCloudinaryAvatarUrl";

const MemberDashboard = () => {
  const [team, setTeam] = useState();
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const { user, updateUser } = useUser();

  useEffect(() => {
    const fetchTeamDetails = async () => {
      try {
        const data = await getTeamDetails();
        setTeam(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load team information",
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
      await removeMember(user._id);
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
      toast({
        title: "Error",
        description: "Failed to leave the team",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (loading) return <Spinner size="xl" color="blue.500" />;

  return (
    <Box mx="auto" width={["100%", "50%"]} borderRadius="md">
      <Heading as="h2" size="lg" mb={6} textAlign="center" color="gray.700">
        Member Dashboard
      </Heading>

      {/* Team Information */}
      <Box
        p={4}
        borderRadius="20"
        padding="35px"
        bg="white"
        mb={6}
        textAlign="center"
        display="flex"
        alignItems="center"
        flexDirection="column"
      >
        <Text fontSize="lg" fontWeight="bold" color="gray.800">
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

      {/* Team Members */}
      <Box>
        <Text fontSize="lg" fontWeight="bold" mb={4} color="gray.700">
          Team Members
        </Text>
        {team.members.length > 0 ? (
          <VStack spacing={4} align="stretch">
            {team.members.map((member) => {
              const cloudinaryUrl = getCloudinaryAvatarUrl(member?._id || member?.id) 
              return (
                <Flex
                  key={member._id}
                  alignItems="center"
                  p={3}
                  bg="white"
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
                    <Text flex="1" color="gray.800" fontWeight="medium">
                      {member.username}{" "}
                      {member._id === team.createdBy && "- Admin"}
                    </Text>
                  </Box>
                </Flex>
              );
            })}
          </VStack>
        ) : (
          <Text color="gray.600">No members in the team</Text>
        )}
      </Box>
    </Box>
  );
};

export default MemberDashboard;
