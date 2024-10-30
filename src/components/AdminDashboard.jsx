import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Heading,
  Text,
  Flex,
  IconButton,
  useToast,
  Spinner,
  VStack,
} from "@chakra-ui/react";
import { MdDelete } from "react-icons/md";
import { getTeamDetails, removeMember } from "../api";
import { useUser } from "../context/UserContext";

const AdminDashboard = () => {
  const [team, setTeam] = useState();
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const { user, updateUser } = useUser();

  // Fetch team details on component mount
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

  // Remove team member
  const handleRemoveMember = async (memberId) => {
    try {
      const response = await removeMember(memberId);
      console.log(response);
      if (response.team === null) {
        updateUser({
          ...user,
          team: null,
        });
      }
      setTeam((prevTeam) => ({
        ...prevTeam,
        members: prevTeam.members.filter((member) => member._id !== memberId),
      }));
      toast({
        title: "Member Removed",
        description: "The member has been successfully removed from the team.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove member",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (loading) return <Spinner size="xl" color="blue.500" />;

  return (
    <Box mx="auto" width="50%" borderRadius="md">
      <Heading as="h2" size="lg" mb={6} textAlign="center" color="gray.700">
        Admin Dashboard
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
        <Box mb={2}>
          <Text fontSize="24px" fontWeight="bold" color="gray.800">
            {team.name}
          </Text>
          <Text fontSize="14px" color="gray.600">
            Team Name
          </Text>
        </Box>
        <Flex
          bg="#efefef"
          padding="15px"
          borderRadius="10"
          width="30%"
          alignItems="center"
          justifyContent="center"
          mt={2}
        >
          <Box>
            <Text fontSize="20px" fontWeight="bold" color="#535353">
              {team.inviteCode}
            </Text>
            <Text fontSize="13px" color="#535353">
              Invite Code
            </Text>
          </Box>
        </Flex>
      </Box>

      {/* Team Members */}
      <Box>
        <Text fontSize="lg" fontWeight="bold" mb={4} color="gray.700">
          Team Members
        </Text>
        {team.members.length > 0 ? (
          <VStack spacing={4} align="stretch">
            {team.members.map((member) => (
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
                <Text flex="1" color="gray.800" fontWeight="medium">
                  {member.username}
                </Text>
                <IconButton
                  icon={<MdDelete />}
                  colorScheme="red"
                  variant="ghost"
                  aria-label="Remove member"
                  onClick={() => handleRemoveMember(member._id)}
                  fontSize="22px"
                />
              </Flex>
            ))}
          </VStack>
        ) : (
          <Text color="gray.600">No members in the team</Text>
        )}
      </Box>
    </Box>
  );
};

export default AdminDashboard;
