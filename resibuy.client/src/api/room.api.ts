import axiosClient from "./base.api";
import type {
  RoomDto,
  CreateRoomDto,
  UpdateRoomStatusDto,
  RoomFilter,
  RoomDetailDto,
} from "../types/dtoModels";

const roomUrl = "/api/Room";

const roomApi = {
  // Lấy danh sách phòng có phân trang
  getAll: async (pageNumber = 1, pageSize = 10,isActive?: boolean, noUsers?:boolean): Promise<{ items: RoomDto[]; totalCount: number; pageNumber: number; pageSize: number; totalPages: number;  }> => {
    try {
      const response = await axiosClient.get(`${roomUrl}`, {
        params: { pageNumber, pageSize, isActive,noUsers },
      });
      if (response.data.code !== 0) {
        throw new Error(response.data.message || "Lỗi khi lấy danh sách phòng");
      }
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.message || "Lỗi khi gọi API lấy danh sách phòng");
    }
  },

  // Lấy phòng theo ID chi tiết (có users)
  getDetail: async (id: string): Promise<RoomDetailDto> => {
    try {
      const response = await axiosClient.get(`${roomUrl}/detail/${id}`);
      if (response.data.code !== 0) {
        throw new Error(response.data.message || "Lỗi khi lấy thông tin chi tiết phòng");
      }
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.message || "Lỗi khi gọi API lấy chi tiết phòng");
    }
  },

  // Lấy phòng theo buildingId (có phân trang)
  getByBuildingId: async (buildingId: string, pageNumber = 1, pageSize = 10,isActive?: boolean, noUsers?:boolean): Promise<{ items: RoomDto[]; totalCount: number; pageNumber: number; pageSize: number; totalPages: number }> => {
    try {
      const response = await axiosClient.get(`${roomUrl}/building/${buildingId}`, {
        params: { pageNumber, pageSize,isActive,noUsers },
      });
      if (response.data.code !== 0) {
        throw new Error(response.data.message || "Lỗi khi lấy danh sách phòng theo tòa nhà");
      }
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.message || "Lỗi khi gọi API lấy phòng theo tòa nhà");
    }
  },

  // Tạo phòng
  create: async (data: CreateRoomDto): Promise<RoomDto> => {
    try {
      const response = await axiosClient.post(`${roomUrl}/create`, data);
      if (response.data.code !== 0) {
        throw new Error(response.data.message || "Lỗi khi tạo phòng");
      }
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.message || "Lỗi khi gọi API tạo phòng");
    }
  },

  // Cập nhật thông tin phòng
  update: async (data: RoomDto): Promise<RoomDto> => {
    try {
      const response = await axiosClient.put(`${roomUrl}`, data);
      if (response.data.code !== 0) {
        throw new Error(response.data.message || "Lỗi khi cập nhật phòng");
      }
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.message || "Lỗi khi gọi API cập nhật phòng");
    }
  },

  // Cập nhật trạng thái phòng
  updateStatus: async (data: UpdateRoomStatusDto): Promise<boolean> => {
    try {
      const response = await axiosClient.put(`${roomUrl}/updateStatus`, data);
      if (response.data.code !== 0) {
        throw new Error(response.data.message || "Lỗi khi cập nhật trạng thái phòng");
      }
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.message || "Lỗi khi gọi API cập nhật trạng thái phòng");
    }
  },

  // Đếm tổng số phòng
  count: async (): Promise<number> => {
    try {
      const response = await axiosClient.get(`${roomUrl}/count`);
      if (response.data.code !== 0) {
        throw new Error(response.data.message || "Lỗi khi đếm số lượng phòng");
      }
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.message || "Lỗi khi gọi API đếm số lượng phòng");
    }
  },

  // Đếm số phòng theo buildingId
  countByBuildingId: async (buildingId: string): Promise<number> => {
    try {
      const response = await axiosClient.get(`${roomUrl}/countroom/building/${buildingId}`);
      if (response.data.code !== 0) {
        throw new Error(response.data.message || "Lỗi khi đếm số lượng phòng theo tòa nhà");
      }
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.message || "Lỗi khi gọi API đếm số lượng phòng theo tòa nhà");
    }
  },

  // Tìm kiếm phòng theo keyword (toàn hệ thống)
  search: async (filter: RoomFilter): Promise<{ items: RoomDto[]; totalCount: number; pageNumber: number; pageSize: number; totalPages: number }> => {
    try {
      const response = await axiosClient.get(`${roomUrl}/search`, {
        params: filter,
      });
      if (response.data.code !== 0) {
        throw new Error(response.data.message || "Lỗi khi tìm kiếm phòng");
      }
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.message || "Lỗi khi gọi API tìm kiếm phòng");
    }
  },

  // Tìm kiếm phòng theo buildingId + keyword
  searchInBuilding: async (filter: RoomFilter): Promise<{ items: RoomDto[]; totalCount: number; pageNumber: number; pageSize: number; totalPages: number }> => {
    try {
      const response = await axiosClient.get(`${roomUrl}/searchrom/building`, {
        params: filter,
      });
      if (response.data.code !== 0) {
        throw new Error(response.data.message || "Lỗi khi tìm kiếm phòng trong tòa nhà");
      }
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.message || "Lỗi khi gọi API tìm kiếm phòng trong tòa nhà");
    }
  },

// Lấy danh sách phòng theo trạng thái toàn hệ thống (có phân trang)
  getByStatus: async (isActive: boolean, pageNumber = 1, pageSize = 10): Promise<{ items: RoomDto[]; totalCount: number; pageNumber: number; pageSize: number; totalPages: number }> => {
    try {
      const response = await axiosClient.get(`${roomUrl}/status`, {
        params: { isActive, pageNumber, pageSize },
      });
      if (response.data.code !== 0) {
        throw new Error(response.data.message || "Lỗi khi lấy phòng theo trạng thái");
      }
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.message || "Lỗi khi gọi API phòng theo trạng thái");
    }
  },

  // Lấy danh sách phòng theo buildingId và trạng thái (có phân trang)
  getByBuildingIdAndStatus: async (buildingId: string, isActive: boolean, pageNumber = 1, pageSize = 10): Promise<{ items: RoomDto[]; totalCount: number; pageNumber: number; pageSize: number; totalPages: number }> => {
    try {
      const response = await axiosClient.get(`${roomUrl}/${buildingId}/status`, {
        params: { isActive, pageNumber, pageSize },
      });
      if (response.data.code !== 0) {
        throw new Error(response.data.message || "Lỗi khi lấy phòng theo buildingId và trạng thái");
      }
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.message || "Lỗi khi gọi API phòng theo buildingId và trạng thái");
    }
  },

  // Đếm số phòng đang hoạt động theo buildingId
  countActiveByBuildingId: async (buildingId: string): Promise<number> => {
    try {
      const response = await axiosClient.get(`${roomUrl}/count/active/${buildingId}`);
      if (response.data.code !== 0) {
        throw new Error(response.data.message || "Lỗi khi đếm phòng hoạt động");
      }
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.message || "Lỗi khi gọi API đếm phòng hoạt động");
    }
  },

  // Đếm số phòng không hoạt động theo buildingId
  countInactiveByBuildingId: async (buildingId: string): Promise<number> => {
    try {
      const response = await axiosClient.get(`${roomUrl}/count/inactive/${buildingId}`);
      if (response.data.code !== 0) {
        throw new Error(response.data.message || "Lỗi khi đếm phòng không hoạt động");
      }
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.message || "Lỗi khi gọi API đếm phòng không hoạt động");
    }
  },
  getByUserId: async (userId: string): Promise<RoomDto[]> => {
  try {
    const response = await axiosClient.get(`${roomUrl}/${userId}`);
    if (response.data.code !== 0) {
      throw new Error(response.data.message || "Lỗi khi lấy danh sách phòng theo userId");
    }
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.message || "Lỗi khi gọi API lấy phòng theo userId");
  }
},
};


export default roomApi;