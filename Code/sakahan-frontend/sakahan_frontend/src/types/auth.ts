export interface AuthState {
  openAuth: boolean;
  isAuthenticated: boolean;
}

export interface RegisterType {
  first_name: string;
  last_name: string;
  register_email: string;
  register_password: string;
  register_repeat_password: string;
}

export interface LoginType {
  login_email: string;
  login_password: string;
}

export interface ResetEmailType {
  reset_email: string;
}

export interface ResetPasswordType {
  reset_password: string;
  reset_repeat_password: string;
}

export type RegisterName =
  | "first_name"
  | "last_name"
  | "register_email"
  | "register_password"
  | "register_repeat_password";
export type LoginName = "login_email" | "login_password";
export type ResetEmailName = "reset_email";
export type ResetPasswordName = "reset_password" | "reset_repeat_password";

export interface InputFieldProps {
  name: RegisterName | LoginName | ResetEmailName | ResetPasswordName;
  id: string;
  label: string;
  type: string;
}

export interface UIDTokenProps {
  uid: string;
  token: string;
}

export interface PromiseUIDTokenProps {
  params: Promise<UIDTokenProps>;
}
