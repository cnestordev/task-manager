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

const MetricChart = () => {
  const [metricData, setMetricData] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const getMetrics = async () => {
      try {
        const { data } = await getMetricData();
        setMetricData(data.metrics);
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to load metric information",
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
    <div style={styles.card}>
      <h3 style={styles.cardTitle}>System Resource Metrics</h3>

      {loading ? (
        <div style={styles.spinnerContainer}>
          <Spinner size="lg" color="#196527" />
        </div>
      ) : metricData.length === 0 ? (
        <p style={styles.noDataText}>No metric data available</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={metricData}>
            {/* X-Axis with Custom Date Formatting */}
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
              }}
              stroke="#196527"
            />

            {/* Y-Axis Label */}
            <YAxis
              label={{
                value: "Usage",
                angle: -90,
                position: "insideLeft",
                offset: -5,
              }}
              stroke="#196527"
            />

            {/* Tooltip Customization */}
            <Tooltip
              contentStyle={{
                backgroundColor: "#f4fff6",
              }}
              labelFormatter={(label) =>
                `Time: ${new Date(label).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}`
              }
              formatter={(value, name) => [
                name === "CPU Usage"
                  ? `${value} (CPU units)` // Show raw CPU units
                  : `${value} MB`, // Show memory usage in MB
                name === "CPU Usage" ? "CPU Usage" : "Memory Usage",
              ]}
            />

            {/* Legend Customization */}
            <Legend verticalAlign="top" align="right" />

            {/* CPU Usage Line */}
            <Line
              type="monotone"
              dataKey="cpuUsage"
              stroke="#0dcb1d"
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6, strokeWidth: 2 }}
              name="CPU Usage"
            />

            {/* Memory Usage Line */}
            <Line
              type="monotone"
              dataKey="memoryUsage"
              stroke="#cb810d"
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

// Inline styling for the card layout and additional elements
const styles = {
  card: {
    backgroundColor: "#f8fff9",
    borderRadius: "20px",
    padding: "25px",
    width: "100%",
    maxWidth: "800px",
    margin: "20px auto",
  },
  cardTitle: {
    margin: "0 0 15px 0",
    color: "#196527",
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
    color: "#888",
    textAlign: "center",
    marginTop: "20px",
    fontStyle: "italic",
    fontSize: "0.9em",
  },
};

export default MetricChart;
