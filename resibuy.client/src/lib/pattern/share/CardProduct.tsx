"use client";

import { Block, Card, Cover, Group, Row, RText, Section } from "@/lib/by/Div";
import { calculateDiscount } from "@/lib/share/calcDiscount";
import { formatPrice } from "@/lib/share/formatPrice";
import Image from "next/image";
import Link from "next/link";

const CardProduct = ({ product }: { product: IProduct }) => {
  return (
    <Link href={`/products/${product.id}`}>
      <Card className="max-w-sm h-full p-2.5 bg-white rounded-md shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col justify-start items-end gap-1 overflow-hidden">
        <Cover className="relative aspect-square w-full overflow-hidden rounded-lg bg-pink-100">
          <Image
            src={
              product.image_url.length === 0
                ? "https://picsum.photos/500"
                : product.image_url
            }
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform"
            loading="lazy"
          />
        </Cover>
        <Section className="self-stretch flex-1 py-1.5 flex flex-col justify-start items-start gap-1 px-2 overflow-hidden">
          <Row className="self-stretch inline-flex justify-between items-start overflow-hidden">
            <Group className="inline-flex flex-col justify-center items-center gap-2.5 overflow-hidden">
              <Block className="justify-start">
                <RText className="text-pink-400 text-lg font-bold font-['Roboto']">
                  {formatPrice(product.sale_price ?? product.price)}
                </RText>
                {product.sale_price != null ? (
                  <RText className="text-neutral-500 text-sm font-normal font-['Roboto'] line-through">
                    {formatPrice(product.price)}
                  </RText>
                ) : (
                  <br />
                )}
              </Block>
            </Group>

            {product.sale_price != null && (
              <Block className="px-2 py-1 bg-purple-500 rounded-md flex justify-center items-center gap-2.5 overflow-hidden">
                <RText className="justify-start text-white text-sm font-semibold">
                  -{calculateDiscount(product.sale_price, product.price)}%
                </RText>
              </Block>
            )}
          </Row>

          <Section className="self-stretch flex-1 flex flex-col justify-start items-start gap-[5px] overflow-hidden">
            <RText className="self-stretch justify-start text-zinc-800 text-lg font-bold font-['Roboto'] line-clamp-2">
              {product.title}
            </RText>
          </Section>

          <Section className="self-stretch  inline-flex justify-start items-start gap-2.5 overflow-hidden">
            <RText className="justify-start text-black text-sm font-normal font-['Roboto'] line-clamp-3">
              {product.description}
            </RText>
          </Section>
        </Section>
      </Card>
    </Link>
  );
};

export default CardProduct;
