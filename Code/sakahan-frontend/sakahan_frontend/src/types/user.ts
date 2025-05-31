import { type UserType } from "@/enums";

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: UserType;
}

export interface UserState {
  authenticatedUser: User | null;
}
