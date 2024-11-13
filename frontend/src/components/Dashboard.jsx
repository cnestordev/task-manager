import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import { useUser } from "../context/UserContext";
import AdminDashboard from "./AdminDashboard";
import MemberDashboard from "./MemberDashboard";
import MetricChart from "./MetricChart";
import Navbar from "./Navbar";
import { NewTeamContainer } from "./NewTeamContainer";

const Dashboard = () => {
  const { user } = useUser();
  const darkMode = user?.darkMode || false;

  const isAdmin = user?.team && user.id === user.team.createdBy;
  const isMember = user?.team && user.id !== user.team.createdBy;

  return (
    <>
      <Navbar />
      <Tabs variant="enclosed">
        <TabList justifyContent="center">
          <Tab
            color={darkMode ? "whiteAlpha.800" : "gray.800"}
            _selected={{
              color: darkMode ? "white" : "black",
              bgColor: darkMode ? "#2d3748" : "gray.100",
            }}
          >
            Teams
          </Tab>
          {user.isAdmin && (
            <Tab
              color={darkMode ? "whiteAlpha.800" : "gray.800"}
              _selected={{
                color: darkMode ? "white" : "black",
                bgColor: darkMode ? "#2d3748" : "gray.100",
              }}
            >
              Metrics
            </Tab>
          )}
        </TabList>

        <TabPanels>
          <TabPanel color={darkMode ? "whiteAlpha.900" : "gray.800"}>
            {isAdmin && <AdminDashboard />}
            {isMember && <MemberDashboard />}
            {!user.team && <NewTeamContainer />}
          </TabPanel>

          {user.isAdmin && (
            <TabPanel color={darkMode ? "whiteAlpha.900" : "gray.800"}>
              <MetricChart />
            </TabPanel>
          )}
        </TabPanels>
      </Tabs>
    </>
  );
};

export default Dashboard;
