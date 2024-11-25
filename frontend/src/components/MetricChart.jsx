import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { getMetricData } from "../api";
import { useToast, Spinner } from "@chakra-ui/react";
import { useUser } from "../context/UserContext";

const MetricChart = () => {
  const [metricData, setMetricData] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const { user } = useUser();
  const darkMode = user?.darkMode || false;

  // dark and light theme colors
  const themeStyles = {
    backgroundColor: darkMode ? "#162029" : "#f8fff9",
    textColor: darkMode ? "#f0f0f0" : "#196527",
    axisColor: darkMode ? "#a0aec0" : "#196527",
    cpuLineColor: darkMode ? "#63b3ed" : "#0dcb1d",
    memoryLineColor: darkMode ? "#f6ad55" : "#cb810d",
    tooltipBackgroundColor: darkMode ? "#2d3748" : "#f4fff6",
  };

  useEffect(() => {
    const getMetrics = async () => {
      try {
        const { data } = await getMetricData();

        const transformedData = data.metrics.cpuUsage.map((cpu, index) => ({
          timestamp: cpu.timestamp,
          cpuUsage: cpu.value,
          memoryUsage: data.metrics.memoryUsage[index]?.value || 0,
        }));

        setMetricData(transformedData);
      } catch (err) {
        const errorMessage = err.response.data.error;
        toast({
          title: "Error",
          description: errorMessage,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        console.error("Failed to load metric information", err);
      } finally {
        setLoading(false);
      }
    };

    getMetrics();
  }, []);

  return (
    <div
      style={{ ...styles.card, backgroundColor: themeStyles.backgroundColor }}
    >
      <h3 style={{ ...styles.cardTitle, color: themeStyles.textColor }}>
        System Resource Metrics
      </h3>

      {loading ? (
        <div style={styles.spinnerContainer}>
          <Spinner size="lg" color={themeStyles.axisColor} />
        </div>
      ) : metricData.length === 0 ? (
        <p style={{ ...styles.noDataText, color: themeStyles.textColor }}>
          No metric data available
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={metricData}>
            <XAxis
              dataKey="timestamp"
              tickFormatter={(timestamp) =>
                new Date(timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              }
              label={{
                value: "Time",
                position: "insideBottomRight",
                offset: -5,
                fill: themeStyles.textColor,
              }}
              stroke={themeStyles.axisColor}
              tick={{ fill: themeStyles.axisColor }}
            />

            <YAxis
              label={{
                value: "Usage",
                angle: -90,
                position: "insideLeft",
                offset: -5,
                fill: themeStyles.textColor,
              }}
              stroke={themeStyles.axisColor}
              tick={{ fill: themeStyles.axisColor }}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: themeStyles.tooltipBackgroundColor,
                color: themeStyles.textColor,
              }}
              labelFormatter={(label) =>
                `Time: ${new Date(label).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}`
              }
              formatter={(value, name) => [
                name === "CPU Usage" ? `${value} (CPU units)` : `${value} MB`,
                name === "CPU Usage" ? "CPU Usage" : "Memory Usage",
              ]}
            />

            <Legend verticalAlign="top" align="right" />

            <Line
              type="monotone"
              dataKey="cpuUsage"
              stroke={themeStyles.cpuLineColor}
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6, strokeWidth: 2 }}
              name="CPU Usage"
            />

            <Line
              type="monotone"
              dataKey="memoryUsage"
              stroke={themeStyles.memoryLineColor}
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6, strokeWidth: 2 }}
              name="Memory Usage"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

const styles = {
  card: {
    borderRadius: "20px",
    padding: "25px",
    width: "100%",
    maxWidth: "800px",
    margin: "20px auto",
  },
  cardTitle: {
    margin: "0 0 15px 0",
    fontSize: "1.4em",
    fontWeight: "bold",
    textAlign: "center",
  },
  spinnerContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100px",
  },
  noDataText: {
    textAlign: "center",
    marginTop: "20px",
    fontStyle: "italic",
    fontSize: "0.9em",
  },
};

export default MetricChart;
