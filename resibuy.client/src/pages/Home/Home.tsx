import { Box, Typography, Button, Stack } from "@mui/material";
import { useToastify } from "../../hooks/useToastify";
import Carousel from "../../animations/Carousel";
import CircularGallery from "../../animations/CirculaGallery";
import { useState } from "react";
import { fakeStores } from "../../fakeData/fakeStoreData";

const Home = () => {
  const toast = useToastify();
  const [stores, setStores] = useState(fakeStores);
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Home
      </Typography>
      <Carousel />
      <Typography variant="h4" gutterBottom>
        Shop 1
      </Typography>
      {stores.map((store) => (
        <Box key={store.id}>
          <Typography> {store.name}</Typography>
          <CircularGallery bend={3} textColor="#ffffff" borderRadius={0.05} />
        </Box>
      ))}

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
