import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import { Link } from "react-router-dom";

const pages = [
  { title: "Home", href: "/" },
  { title: "Create Digital Asset", href: "/create" },
  { title: "My Digital Asset", href: "/my-assets" },
];

const Header = () => {
  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ justifyContent: "center" }}>
          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {pages.map((page, idx) => (
              <Button
                key={idx}
                sx={{ my: 2, mx: 1, color: "white", display: "block" }}
                component={Link}
                to={page.href}
              >
                {page.title}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
export default Header;
