import { useState, useCallback } from "react";
import type { User } from "../types";
import { getUser, saveUser, clearUser } from "../services/storage";

export function useUser() {
  const [user, setUserState] = useState<User | null>(() => getUser());

  const setUser = useCallback((u: User) => {
    saveUser(u);
    setUserState(u);
  }, []);

  const removeUser = useCallback(() => {
    clearUser();
    setUserState(null);
  }, []);

  return { user, setUser, removeUser };
}
