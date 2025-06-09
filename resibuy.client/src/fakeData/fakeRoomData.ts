import type { Room, Building, Area } from "../types/models";
import { fakeUserRooms } from "./fakeUserRoomData";

export const fakeAreas: Area[] = [
  {
    id: "1",
    name: "Downtown",
    description: "Central business district",
    buildings: [],
  },
];

export const fakeBuildings: Building[] = [
  {
    id: "1",
    name: "Sky Tower",
    address: "789 Sky Avenue, New York, NY 10001",
    areaId: "1",
    totalFloors: 20,
    description: "Luxury apartment building",
    imageUrl: "https://example.com/skytower.jpg",
    rooms: [],
  },
];

export const fakeRooms: Room[] = [
  {
    id: "1",
    name: "101",
    buildingId: "1",
    floor: 1,
    area: 50,
    price: 1000,
    status: true,
    userRooms: fakeUserRooms.filter((ur) => ur.roomId === "1"),
  },
  {
    id: "2",
    name: "201",
    buildingId: "1",
    floor: 2,
    area: 75,
    price: 1500,
    status: true,
    userRooms: fakeUserRooms.filter((ur) => ur.roomId === "2"),
  },
];
