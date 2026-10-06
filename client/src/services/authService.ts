import {
  apiRequest,
  setTokens,
  setStoredUser,
  clearTokens,
  type AuthUser,
} from "./api";

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export const signup = async (input: {
  name: string;
  email: string;
  password: string;
  role: "USER" | "BUSINESS";
  phone?: string;
}): Promise<AuthResponse> => {
  const result = await apiRequest<AuthResponse>("/auth/signup", {
    method: "POST",
    body: input,
    auth: false,
  });

  setTokens(result.accessToken, result.refreshToken);
  setStoredUser(result.user);

  return result;
};

export const signin = async (input: {
  email: string;
  password: string;
}): Promise<AuthResponse> => {
  const result = await apiRequest<AuthResponse>("/auth/signin", {
    method: "POST",
    body: input,
    auth: false,
  });

  setTokens(result.accessToken, result.refreshToken);
  setStoredUser(result.user);

  return result;
};

export const logout = async () => {
  try {
    await apiRequest("/auth/logout", { method: "POST" });
  } finally {
    clearTokens();
  }
};

export const getMe = () => apiRequest<AuthUser>("/auth/me");

export const updateProfile = async (input: {
  name?: string;
  phone?: string;
}): Promise<AuthUser> => {
  const result = await apiRequest<AuthUser>("/auth/me", {
    method: "PATCH",
    body: input,
  });

  setStoredUser(result);

  return result;
};

export const changePassword = (input: {
  currentPassword: string;
  newPassword: string;
}) =>
  apiRequest<{ message: string }>("/auth/password", {
    method: "PATCH",
    body: input,
  });