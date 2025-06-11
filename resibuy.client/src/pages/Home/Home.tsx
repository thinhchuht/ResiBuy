import { Box } from "@mui/material";
import Carousel from "../../animations/Carousel";
import { fakeEventData } from "../../fakeData/fakeEventData";
import AricleSection from "./ArticleSection";
import VoucherSection from "./VoucherSection";
import CategorySection from "./CategorySection";
import FeaturedProductSection from "./FeaturedProductSection";

const Home = () => {
  return (
    <Box>
      <Box sx={{ width: "100%", padding: 4, marginBottom: "10px" }}>
        <Carousel items={fakeEventData} />
      </Box>
      <VoucherSection />
      <CategorySection />
      <FeaturedProductSection />
      <AricleSection />
    </Box>
  );
};

export default Home;
