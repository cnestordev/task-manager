import { ChakraProvider } from "@chakra-ui/react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import Providers from "./context/Providers";
import { useUser } from "./context/UserContext.jsx";
import "./index.css";
import createTheme from "./theme/theme.js";

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
