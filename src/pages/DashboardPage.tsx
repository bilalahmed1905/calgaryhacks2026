import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dashboard } from "../components/dashboard/Dashboard";
import { getUser, getOnboarding } from "../services/storage";

export function DashboardPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const user = getUser();
    const onboarding = getOnboarding();

    if (!user) {
      navigate("/");
    } else if (!onboarding) {
      navigate("/onboarding");
    }
  }, [navigate]);

  return <Dashboard />;
}
