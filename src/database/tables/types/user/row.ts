import type { UserCreatedAt } from "@tables/types/user/createdAt";
import type { UserId } from "@tables/types/user/id";
import type { UserUpdatedAt } from "@tables/types/user/updatedAt";

export interface UserRow {
  id: UserId;
  createdAt: UserCreatedAt;
  updatedAt: UserUpdatedAt;
}
