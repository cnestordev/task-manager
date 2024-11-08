import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import { useUser } from "../context/UserContext";
import AdminDashboard from "./AdminDashboard";
import MemberDashboard from "./MemberDashboard";
import MetricChart from "./MetricChart";
import Navbar from "./Navbar";
import { NewTeamContainer } from "./NewTeamContainer";

const Dashboard = () => {
  const { user } = useUser();

  const isAdmin = user?.team && user.id === user.team.createdBy;
  const isMember = user?.team && user.id !== user.team.createdBy;

  return (
    <>
      <Navbar />
      <Tabs>
        <TabList justifyContent="center">
          <Tab>Teams</Tab>
          {user.isAdmin && <Tab>Metrics</Tab>}
        </TabList>

        <TabPanels>
          <TabPanel>
            {isAdmin && <AdminDashboard />}
            {isMember && <MemberDashboard />}
            {!user.team && <NewTeamContainer />}
          </TabPanel>

          {user.isAdmin && (
            <TabPanel>
              <MetricChart />
            </TabPanel>
          )}
        </TabPanels>
      </Tabs>
    </>
  );
};

export default Dashboard;
