import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { OnboardingFlow } from "../components/onboarding/OnboardingFlow";
import { getUser, getOnboarding } from "../services/storage";

export function OnboardingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const user = getUser();
    const onboarding = getOnboarding();

    if (!user) {
      navigate("/signup");
    } else if (onboarding) {
      navigate("/dashboard");
    }
  }, [navigate]);

  return <OnboardingFlow />;
}
