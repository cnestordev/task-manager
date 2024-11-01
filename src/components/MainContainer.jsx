import { Container } from "@chakra-ui/react";

export const MainContainer = ({ children }) => {
  return (
    <Container maxWidth="100%" className="container">
      {children}
    </Container>
  );
};
