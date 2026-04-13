"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@/types";
import { OWNER_EMAIL } from "@/lib/owner";
import { STORAGE_USER, STORAGE_USERS_DB } from "@/lib/storage-keys";

type StoredUser = User & { password: string };

const ADMIN_USER_ID = "admin";
const ADMIN_NAME = "Admin";
const ADMIN_PASSWORD = "1234";

/** Фиксированный админ в mock-БД: всегда есть, пароль сбрасывается на демо-значение при загрузке. */
function ensureAdminUser() {
  if (typeof window === "undefined") return;
  const adminEmail = OWNER_EMAIL.trim();
  const db = readJson<StoredUser[]>(STORAGE_USERS_DB, []);
  const next = db.filter(
    (x) =>
      x.id !== ADMIN_USER_ID && x.email.trim().toLowerCase() !== adminEmail.toLowerCase(),
  );
  next.push({
    id: ADMIN_USER_ID,
    email: adminEmail,
    name: ADMIN_NAME,
    password: ADMIN_PASSWORD,
  });
  writeJson(STORAGE_USERS_DB, next);
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

type AuthContextValue = {
  user: User | null;
  login: (email: string, password: string) => { ok: boolean; message?: string };
  register: (
    email: string,
    password: string,
    name: string,
  ) => { ok: boolean; message?: string };
  changePassword: (
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) => { ok: boolean; message?: string };
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    ensureAdminUser();
    const u = readJson<User | null>(STORAGE_USER, null);
    setUser(u);
  }, []);

  const persistUser = useCallback((u: User | null) => {
    setUser(u);
    if (u) writeJson(STORAGE_USER, u);
    else localStorage.removeItem(STORAGE_USER);
  }, []);

  const login = useCallback((email: string, password: string) => {
    ensureAdminUser();
    const db = readJson<StoredUser[]>(STORAGE_USERS_DB, []);
    const emailNorm = email.trim().toLowerCase();
    const found = db.find(
      (x) => x.email.trim().toLowerCase() === emailNorm && x.password === password,
    );
    if (!found) {
      return { ok: false, message: "Неверный email или пароль." };
    }
    const { password: _, ...safe } = found;
    persistUser(safe);
    return { ok: true };
  }, [persistUser]);

  const register = useCallback(
    (email: string, password: string, name: string) => {
      ensureAdminUser();
      const db = readJson<StoredUser[]>(STORAGE_USERS_DB, []);
      const emailNorm = email.trim().toLowerCase();
      if (db.some((x) => x.email.trim().toLowerCase() === emailNorm)) {
        return { ok: false, message: "Этот email уже зарегистрирован." };
      }
      const nu: StoredUser = {
        id: crypto.randomUUID(),
        email: email.trim(),
        name: name.trim(),
        password,
      };
      db.push(nu);
      writeJson(STORAGE_USERS_DB, db);
      const { password: _, ...safe } = nu;
      persistUser(safe);
      return { ok: true };
    },
    [persistUser],
  );

  const changePassword = useCallback(
    (userId: string, currentPassword: string, newPassword: string) => {
      const db = readJson<StoredUser[]>(STORAGE_USERS_DB, []);
      const index = db.findIndex((x) => x.id === userId);
      if (index === -1) {
        return { ok: false, message: "Пользователь не найден в локальном хранилище." };
      }
      if (db[index].password !== currentPassword) {
        return { ok: false, message: "Текущий пароль указан неверно." };
      }
      const next = [...db];
      next[index] = { ...next[index], password: newPassword };
      writeJson(STORAGE_USERS_DB, next);
      return { ok: true };
    },
    [],
  );

  const logout = useCallback(() => {
    persistUser(null);
  }, [persistUser]);

  const value = useMemo(
    () => ({ user, login, register, changePassword, logout }),
    [user, login, register, changePassword, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth вне AuthProvider");
  return ctx;
}
