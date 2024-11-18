import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { ChakraProvider } from "@chakra-ui/react";
import Providers from "./context/Providers";
import createTheme from "./theme/theme.js";
import { useUser } from "./context/UserContext.jsx";

const DynamicChakraProvider = ({ children }) => {
  const { user } = useUser();

  const theme = createTheme(user);

  return <ChakraProvider theme={theme}>{children}</ChakraProvider>;
};

createRoot(document.getElementById("root")).render(
  <Providers>
    <DynamicChakraProvider>
      <App />
    </DynamicChakraProvider>
  </Providers>
);
