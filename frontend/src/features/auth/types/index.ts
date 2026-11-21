export interface UserRegisterInput {
  username: string;
  full_name: string;
  email: string;
  password: string;
}

export interface UserLoginInput {
  username: string;
  password: string;
}