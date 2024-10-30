import { Container } from "@chakra-ui/react";

export const MainContainer = ({ children }) => {
  return (
    <Container maxWidth="initial" className="container">
      {children}
    </Container>
  );
};
