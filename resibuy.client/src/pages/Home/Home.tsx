import { Box, Typography, Button, Stack } from "@mui/material";
import { useToastify } from "../../hooks/useToastify";
import Carousel from "../../animations/Carousel";
import CircularGallery from "../../animations/CirculaGallery";
import { useState, useRef } from "react";
import { fakeStores } from "../../fakeData/fakeStoreData";
import { DEFAULT_ITEMS } from "../../fakeData/fakeEventData";

const Home = () => {
  const toast = useToastify();
  const [stores] = useState(fakeStores);
  const galleryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  return (
    <Box sx={{backgroundColor : "#fef6f5"}}>
      <Typography variant="h4" gutterBottom>
        Trang chủ
      </Typography>

      <Carousel items={DEFAULT_ITEMS} />
      {stores.map((store) => (
        <Box key={store.id} sx={{ marginBottom: "50px" }}>
          <Typography variant="h5"> {store.name}</Typography>
          <CircularGallery
            bend={2}
            textColor="black"
            borderRadius={0.05}
            items={store.products}
            ref={(el: HTMLDivElement | null) => {
              galleryRefs.current[store.id] = el;
            }}
          />
        </Box>
      ))}

      <Stack direction="row" spacing={2} mt={3}>
        <Button
          variant="contained"
          color="success"
          onClick={() => toast.success("Welcome to our platform!")}
        >
          Show Success
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={() => toast.error("Something went wrong!")}
        >
          Show Error
        </Button>
        <Button
          variant="contained"
          color="info"
          onClick={() => toast.info("New features available!")}
        >
          Show Info
        </Button>
        <Button
          variant="contained"
          color="warning"
          onClick={() => toast.warning("Please check your cart!")}
        >
          Show Warning
        </Button>
      </Stack>
    </Box>
  );
};

export default Home;
