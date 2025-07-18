import { Box } from "@mui/material";
import ProductCard from "../../components/ProductCard";
import type { Product } from "../../types/models";

interface ProductGridProps {
  filteredProducts: Product[];
  productActions: {
    icon: React.ReactNode;
    onClick: (product: Product) => void;
    label: string;
  }[];
  onResetState?: () => void;
}

const ProductGridSection = ({
  filteredProducts,
  productActions,
  onResetState,
}: ProductGridProps) => {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" },
        gap: 3,
      }}
    >
      {filteredProducts.map((product) => (
        <Box key={product.id}>
          <ProductCard product={product} productActions={productActions} onResetState={onResetState} />
        </Box>
      ))}
    </Box>
  );
};
export default ProductGridSection;
