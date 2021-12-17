import { Container } from "@mui/material";
import { Outlet } from "react-router-dom";
import "./App.css";
import Header from "./components/Header";

function App() {
  return (
    <>
      <Header />
      <Container maxWidth="md" sx={{ py: 2 }}>
        <Outlet />
      </Container>
    </>
  );
}

export default App;
