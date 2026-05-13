import type { UserCreatedAt } from "@tables/types/user/createdAt.js";
import type { UserId } from "@tables/types/user/id.js";
import type { UserUpdatedAt } from "@tables/types/user/updatedAt.js";

export interface UserRow {
  id: UserId;
  createdAt: UserCreatedAt;
  updatedAt: UserUpdatedAt;
}
