import type { Report } from "../types/models";

export const fakeReports: Report[] = [
  {
    id: "1",
    title: "Maintenance Request",
    content: "The air conditioning in room 101 is not working properly",
    createdAt: "2024-01-15T10:00:00Z",
    userId: "2",
  },
  {
    id: "2",
    title: "Noise Complaint",
    content: "Loud music from neighboring room",
    createdAt: "2024-01-20T15:30:00Z",
    userId: "2",
  },
];
