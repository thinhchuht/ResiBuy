import axiosClient from "./base.api";

const voucherUrl = "/api/voucher";

export interface GetAllVouchersParams {
  storeId?: string;
  isActive?: boolean | null;
  startDate?: Date;
  endDate?: Date;
  pageNumber?: number;
  pageSize?: number;
  userId?: string | null;
  minOrderPrice?: number;
}

export interface CreateVoucherDto {
  discountAmount: number;
  type: string;
  quantity: number;
  minOrderPrice: number;
  maxDiscountPrice: number;
  startDate: Date;
  endDate: Date;
  storeId: string;
}

export interface UpdateQuantityVoucherDto {
  id: string;
  quantity: number;
  storeId: string;
}

export interface ActiveVoucherDto {
  id: string;
  isActive: boolean;
  storeId: string;
}

const voucherApi = {
  getAll: async (params: GetAllVouchersParams) => {
    const response = await axiosClient.get(voucherUrl, { params });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await axiosClient.get(`${voucherUrl}/${id}`);
    return response.data;
  },
  create: async (data: CreateVoucherDto) => {
    const response = await axiosClient.post(voucherUrl, data);
    return response.data;
  },
  updateQuantity: async (data: UpdateQuantityVoucherDto) => {
    const response = await axiosClient.put(`${voucherUrl}/quantity`, data);
    return response.data;
  },
  active: async (data: ActiveVoucherDto) => {
    const response = await axiosClient.put(`${voucherUrl}/active`, data);
    return response.data;
  },
};

export default voucherApi;
