'use client'

import React from "react";
import { useAddToCartMutation } from "@/process/api/apiCart";
import { useSelector } from "react-redux";
import { RootState } from "@/process/api/redux";
import toast from "react-hot-toast";
import { RText, Wrap } from "@/lib/by/Div";

interface AddToCartWrapperProps {
  productId: string;
  quantity?: number;
  children: React.ReactElement<any, any>;
  showErrorMsg?: boolean;
}

const AddToCartWrapper: React.FC<AddToCartWrapperProps> = ({
  productId,
  quantity = 1,
  children,
  showErrorMsg = false
}) => {
  const cartItems = useSelector((state: RootState) => state.cart.cartItems);
  const cartItem = cartItems.find((c) => c.product_id === productId);
  const isExceedQuanity = (quantity + (cartItem?.quantity ?? 0)) > (cartItem?.product.total_stock ?? 999);
  const [addToCart, { isLoading }] = useAddToCartMutation();

  const handleClick = async (event: React.MouseEvent) => {
    event.preventDefault();
    try {
      if (isExceedQuanity) {
        toast.error("Already added maximum stock limit for this product");
        return;
      }
      await addToCart({ productId, quantity }).unwrap();
    } catch (err) {
      console.error("Add to cart failed", err);
    }
  };

  return (
    <Wrap className="flex-1">
      {React.cloneElement(children, {
        onClick: handleClick,
        disabled: isLoading || children.props.disabled || isExceedQuanity,
      })}
      {showErrorMsg && isExceedQuanity && (
        <RText className="text-red-500 text-sm mt-1">You&apos;ve added the maximum stock for this product.</RText>
      )}
    </Wrap>
  );
};

export default AddToCartWrapper;
