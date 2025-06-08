import type { RefreshToken } from "../types/models";

export const fakeRefreshTokens: RefreshToken[] = [
  {
    id: "1",
    userId: "2",
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ",
    expiresAt: "2024-12-31T23:59:59Z",
  },
];
