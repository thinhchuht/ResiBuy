import { Block } from "@/lib/by/Div";
import { map } from "lodash";
import ProductCard from "./ProductCard";

export function ProductGrid({products}:{products:IProduct[]}) {
  return (
    <Block className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 py-4 px-4 sm:px-6 max-w-7xl mx-auto">
      {map(products, (product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </Block>
  );
}
