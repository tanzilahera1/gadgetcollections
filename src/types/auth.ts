// src/types/auth.ts
export interface ILoginInput {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface ISignUpInput {
  fullName: string;
  email: string;
  password: string;
}
