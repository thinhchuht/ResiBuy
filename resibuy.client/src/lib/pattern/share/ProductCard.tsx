// components/ProductCard.tsx
import React from "react";
import { ShoppingBasketIcon, Star } from "lucide-react";
import Image from "next/image";
import { Card, Column, Cover, Row, RText, Wrap } from "@/lib/by/Div";
import { formatPrice } from "../../share/formatPrice";
import Link from "next/link";
import CustomTooltip from "./CustomTooltip";
import { calculateDiscount } from "@/lib/share/calcDiscount";
import AddToCartWrapper from "./AddToCartWrapper";

interface ProductCardProps {
  product: IProduct;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { id, image_url, title, sale_price, price } = product;
  return (
    <Link href={`/products/${id}`} className="flex-1 flex">
      <Card className="max-w-sm flex-1 group p-2 cursor-pointer bg-white dark:bg-zinc-900 rounded-xl shadow flex flex-col gap-3">
        {/* Product Image */}
        <Cover className="relative aspect-square w-full overflow-hidden rounded-lg bg-pink-100">
          <Image
            src={
              image_url.length === 0 ? "https://picsum.photos/500" : image_url
            }
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform"
            loading="lazy"
          />
        </Cover>
        <Wrap className="flex flex-col p-2 py-0 !items-start flex-1 gap-2">
          <Column className="justify-between items-center w-full">
            {sale_price != null ? (
              <p className="text-gray-400 line-through text-sm">
                {formatPrice(price)}
              </p>
            ) : (
              <br />
            )}
            <Row className="flex justify-between w-full">
              <RText className="text-pink-600 font-semibold text-lg leading-none mb-1">
                {formatPrice(sale_price ?? price)}
              </RText>
              {sale_price != null && (
                <RText className="bg-purple-500 flex items-center text-white rounded-md text-xs px-1 font-semibold">
                  -{calculateDiscount(sale_price, price)}%
                </RText>
              )}
            </Row>
            <RText className="text-sm text-gray-500 font-bold tracking-base py-1">
              {product.productBrand.title}
            </RText>
            <h3 className="text-lg font-semibold line-clamp-2 leading-tight">
              {title}
            </h3>
          </Column>

          <p className="text-sm text-gray-700 line-clamp-2">
            {product.description}
          </p>

          {/* Rating & Favorite at the bottom */}
          <Row className="flex justify-between items-center w-full mt-auto">
            <Row className="flex items-center justify-center text-yellow-500 text-xs">
              <RText className="mt-0.5 text-gray-800 mr-1 ">
                {product?.rating != null
                  ? Number(product.rating).toFixed(2)
                  : "N/A"}
              </RText>
              <Star size={14} className={`${"text-yellow-400 fill-current"}`} />
              <RText className="text- text-gray-800 ml-1">
                <span>
                  {product?.reviews_count != null
                    ? Number(product.reviews_count)
                    : "N/A"}
                </span>
              </RText>
            </Row>

            <Row className="flex items-center justify-center">
              <AddToCartWrapper productId={product.id}>
                <button className="text-pink-500 p-1 rounded-full transition-colors transition-transform duration-150 ease-in-out hover:bg-pink-100 active:scale-90">
                  <CustomTooltip text="Add to Cart!" position="top">
                    <ShoppingBasketIcon
                      size={20}
                      className="transform origin-center"
                    />
                  </CustomTooltip>
                </button>
              </AddToCartWrapper>
              <RText className="text-xs text-gray-800 mt-0.5">(20)</RText>
            </Row>
          </Row>
        </Wrap>

        {/* Add to Cart Button */}
      </Card>
    </Link>
  );
};

export default ProductCard;
