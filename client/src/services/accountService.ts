import { apiRequest, getStoredUser, setStoredUser } from "./api";

export interface AccountInfo {
  name: string;
  email: string;
  phone: string;
}

const readString = (value: unknown) =>
  typeof value === "string" ? value : "";

/*
 * /auth/me cavabı { user: {...} } və ya birbaşa {...} ola bilər.
 * İkisini də qəbul edirik.
 */
export const readAccount = (value: unknown): AccountInfo | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;

  const source =
    record.user && typeof record.user === "object"
      ? (record.user as Record<string, unknown>)
      : record;

  return {
    name: readString(source.name),
    email: readString(source.email),
    phone: readString(source.phone),
  };
};

export interface UpdateProfileInput {
  name: string;
  phone?: string;
}

/*
 * Profili yeniləyir və brauzerdə yadda saxlanmış istifadəçini də
 * təzələyir: beləcə Dashboard və digər səhifələr yeni adı dərhal göstərir.
 */
export const updateMyProfile = async (input: UpdateProfileInput) => {
  const result = await apiRequest<unknown>("/auth/me", {
    method: "PATCH",
    body: input,
  });

  const info = readAccount(result);
  const stored = getStoredUser();

  if (stored) {
    setStoredUser({
      ...stored,
      name: info?.name || input.name,
      phone: info?.phone || input.phone || stored.phone,
    });
  }

  return result;
};

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export const changePassword = (input: ChangePasswordInput) =>
  apiRequest<{ message?: string }>("/auth/password", {
    method: "PATCH",
    body: input,
  });

export const getErrorText = (error: unknown, fallback: string) =>
  error instanceof Error && error.message ? error.message : fallback;