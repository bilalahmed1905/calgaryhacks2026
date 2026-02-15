import { useState, useCallback } from "react";
import type { UserProfile } from "../types";
import { getProfile, saveProfile, clearProfile } from "../services/storage";

export function useUserProfile() {
  const [profile, setProfileState] = useState<UserProfile | null>(() =>
    getProfile()
  );

  const setProfile = useCallback((p: UserProfile) => {
    saveProfile(p);
    setProfileState(p);
  }, []);

  const removeProfile = useCallback(() => {
    clearProfile();
    setProfileState(null);
  }, []);

  return { profile, setProfile, removeProfile };
}
