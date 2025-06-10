import { Box } from "@mui/material";
import Carousel from "../../animations/Carousel";
import { DEFAULT_ITEMS } from "../../fakeData/fakeEventData";
import Category from "./Category";
import FeaturedProduct from "./FeaturedProduct";
import Aricle from "./Article";
import Voucher from "./Voucher";

const Home = () => {
  return (
    <Box>
      <Box sx={{ width: "100%", padding: 4, marginBottom: "10px" }}>
        <Carousel items={DEFAULT_ITEMS} />
      </Box>
      <Voucher />
      <Category />
      <FeaturedProduct />
      <Aricle />
    </Box>
  );
};

export default Home;
