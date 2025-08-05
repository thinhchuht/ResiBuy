import { Box } from "@mui/material";
import StoreSalesSummary from "./Analysis/StoreSalesSummary";
import TopSaleProducts from "./Analysis/TopSaleProducts";
import { useParams } from "react-router-dom";

const Dashboard: React.FC = () => {
  const { storeId } = useParams<{ storeId: string }>();

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 30);

  const startDateStr = startDate.toISOString();
  const endDateStr = endDate.toISOString();

  if (!storeId) return null;

  return (
    <Box display="flex" flexDirection="column" gap={4}>
      <StoreSalesSummary
        storeId={storeId}
        startDate={startDateStr}
        endDate={endDateStr}
      />

      <TopSaleProducts
        storeId={storeId}
        startDate={startDateStr}
        endDate={endDateStr}
      />
    </Box>
  );
};

export default Dashboard;
