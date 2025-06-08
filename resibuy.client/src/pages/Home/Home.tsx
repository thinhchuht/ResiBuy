import React from "react";
import { Box, Typography, Button, Stack } from "@mui/material";
import { useToastify } from "../../hooks/useToastify";

const Home = () => {
  const toast = useToastify();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Home
      </Typography>
      <Stack direction="row" spacing={2} mt={3}>
        <Button variant="contained" color="success" onClick={() => toast.success("Welcome to our platform!")}>
          Show Success
        </Button>
        <Button variant="contained" color="error" onClick={() => toast.error("Something went wrong!")}>
          Show Error
        </Button>
        <Button variant="contained" color="info" onClick={() => toast.info("New features available!")}>
          Show Info
        </Button>
        <Button variant="contained" color="warning" onClick={() => toast.warning("Please check your cart!")}>
          Show Warning
        </Button>
      </Stack>
    </Box>
  );
};

export default Home;
