export type SignupInput = {
  name: string;
  email: string;
  password: string;
  role: "USER" | "BUSINESS";
  phone?: string;
};

export type SigninInput = {
  email: string;
  password: string;
};