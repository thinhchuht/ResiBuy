import { Box } from "@mui/material";
import StoreSalesSummary from "./Analysis/StoreSalesSummary";
import { useParams } from "react-router-dom";

const Dashboard: React.FC = () => {
  const { storeId } = useParams<{ storeId: string }>();
  return (
    <Box>
      {storeId && (
        <StoreSalesSummary
          storeId={storeId}
          startDate="2025-07-01T00:00:00"
          endDate="2025-07-29T23:59:59"
        />
      )}
    </Box>
  );
};
export default Dashboard;
