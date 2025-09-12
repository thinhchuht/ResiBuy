
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
  sold: number;
  price: number;
  weight: number;
  quantity: number;
  image: ImageDto;
  additionalData: AdditionalDataDto[];
}

export interface CategoryDto {
  id: string;
  name: string;
  status: boolean;
}

export interface ProductDto {
  id: number;
  name: string;
  describe: string;
  isOutOfStock: boolean;
  discount: number;
  sold: number;
  storeId: string;
  categoryId: string;
  category: CategoryDto;
  avarageRate: number;
  productDetails: ProductDetailDto[];
}

export interface ProductFilter {
  pageNumber: number;
  pageSize: number;
  categoryId?: string;
}
