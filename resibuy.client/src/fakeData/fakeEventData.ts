import type { EventItem } from "../types/models";
import { fakeStores } from "./fakeStoreData";

export const fakeEventData: EventItem[] = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=2070&auto=format&fit=crop",
      title: "Khuyến mãi Công nghệ",
      description: "Ưu đãi cho thiết bị công nghệ mới nhất",
      storeId: fakeStores[0].id
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071&auto=format&fit=crop",
      title: "Giảm giá Thời trang",
      description: "Ra mắt bộ sưu tập mùa hè",
      storeId: fakeStores[1].id
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?q=80&w=2064&auto=format&fit=crop",
      title: "Sự kiện Đồ gia dụng",
      description: "Ưu đãi trang trí nhà cửa",
      storeId: fakeStores[2].id
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?q=80&w=2101&auto=format&fit=crop",
      title: "Hàng mới về Công nghệ",
      description: "Khám phá sản phẩm mới nhất",
      storeId: fakeStores[0].id
    },
    {
      id: 5,
      image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2070&auto=format&fit=crop",
      title: "Bộ sưu tập Thời trang",
      description: "Phong cách mùa mới đã có sẵn",
      storeId: fakeStores[1].id
    }
  ];