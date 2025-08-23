
export interface AreaDto {
  id?: string;
  name: string;
  isActive?: boolean;
  longtitude?: string;
  latitude?: string;
}

export interface UpdateStatusAreaDto {
  id: string;
}
export interface BuildingDto {
  id?: string;
  name: string;
  isActive?: boolean;
  areaId?: string;
 
}

export interface CreateBuildingDto {
  name: string;
  areaId: string;
}

export interface UpdateStatusBuildingDto {
  buildingId: string;
}
export interface UserDto {
  id: string;
  email: string;
  phoneNumber: string;
  fullName: string;
  dateOfBirth: string;
  roles: string[];
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
 avatar?: {
    url: string;
  };
  rooms:string[];
}

export interface RoomDetailDto {
  id: string;
  name: string;
  isActive: boolean;
  buildingId: string;
  users: UserDto[];
}
// src/types/models.ts

export interface RoomDto {
  id?: string;
  name: string;
  isActive?: boolean;
  buildingId?: string;
  userCount?: string;
}

export interface CreateRoomDto {
  name: string;
  buildingId: string;
}

export interface UpdateRoomStatusDto {
  RoomId: string;
}

export interface RoomFilter {
  pageNumber?: number;
  pageSize?: number;
  keyword?: string;
  buildingId?: string;
  isActive? :boolean;
  noUser?: boolean;
}
export interface CategoryImage {
  id: string;
  url: string;
  thumbUrl: string;
  name: string;
}

export interface CreateCategoryDto {
  name: string;
  status: boolean;
  image: CategoryImage;
}

export interface UpdateCategoryDto extends CreateCategoryDto {
  id: string;
}
export interface OrderDto {
  id: string;
  userId: string;
  shipper?: {
    phoneNumber: string;
  };
  createAt: string;
  updateAt?: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  totalPrice: number;
  shippingFee?: number;
  note?: string;
  roomQueryResult?: {
    name: string;
    buildingName: string;
    areaName: string;
  };
  store?: {
    name: string;
  };
  orderItems: {
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }[];
}