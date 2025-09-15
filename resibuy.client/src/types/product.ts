export interface ImageDto {
  id: string;
  url: string;
  thumbUrl: string;
  name: string;
}

export interface AdditionalDataDto {
  id: number;
  key: string;
  value: string;
}

export interface ProductDetailDto {
  id: number;
  isOutOfStock: boolean;
  productId: number;
  sold: number;
  price: number;
  weight: number;
  quantity: number;
  image: ImageDto;
  additionalData: AdditionalDataDto[];
  // Không cần cartItems, orderItems, reviews ở DTO phía client
}

export interface CategoryDto {
  id: string;
  name: string;
  status: boolean;
}

export interface PromotionDto {
  id: number;
  name: string;
  discount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface ProductDto {
  id: number;
  name: string;
  describe: string;
  isOutOfStock: boolean;
  promotionId: number;
  createdAt: string;
  updatedAt: string;
  storeId: string;
  categoryId: string;
  category: CategoryDto;
  promotion: PromotionDto;
  productDetails: ProductDetailDto[];
}

export interface ProductFilter {
  pageNumber: number;
  pageSize: number;
  categoryId?: string;
}
