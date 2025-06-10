import type { EventItem } from "../types/models";
import { fakeStores } from "./fakeStoreData";

export const DEFAULT_ITEMS: EventItem[] = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=2070&auto=format&fit=crop",
      title: "Tech Haven Promotion",
      description: "Special deals on latest tech gadgets",
      storeId: fakeStores[0].id
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071&auto=format&fit=crop",
      title: "Fashion Forward Sale",
      description: "Summer collection launch",
      storeId: fakeStores[1].id
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?q=80&w=2064&auto=format&fit=crop",
      title: "Home Essentials Event",
      description: "Home decoration special offers",
      storeId: fakeStores[2].id
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?q=80&w=2101&auto=format&fit=crop",
      title: "Tech Haven New Arrivals",
      description: "Check out our latest products",
      storeId: fakeStores[0].id
    },
    {
      id: 5,
      image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2070&auto=format&fit=crop",
      title: "Fashion Forward Collection",
      description: "New season styles available",
      storeId: fakeStores[1].id
    }
  ];