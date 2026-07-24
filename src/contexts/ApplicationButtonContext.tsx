import { useAuth } from "@clerk/clerk-react";
import { fetchUserSummary } from "@/lib/api";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface ApplicationButtonContextValue {
  hasApplication: boolean;
  isLoading: boolean;
  refreshApplicationStatus: () => Promise<void>;
}

const ApplicationButtonContext = createContext<ApplicationButtonContextValue>({
  hasApplication: false,
  isLoading: false,
  refreshApplicationStatus: async () => undefined,
});

export function ApplicationButtonProvider({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  const [hasApplication, setHasApplication] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const refreshApplicationStatus = useCallback(async () => {
    if (!isSignedIn) {
      setHasApplication(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetchUserSummary();
      setHasApplication(response.summary.has_application);
    } catch (error) {
      console.error("Failed to fetch user summary for application CTA", error);
      setHasApplication(false);
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn]);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    void refreshApplicationStatus();
  }, [isLoaded, refreshApplicationStatus]);

  const value = useMemo(
    () => ({
      hasApplication,
      isLoading,
      refreshApplicationStatus,
    }),
    [hasApplication, isLoading, refreshApplicationStatus],
  );

  return (
    <ApplicationButtonContext.Provider value={value}>
      {children}
    </ApplicationButtonContext.Provider>
  );
}

export function useApplicationButtonState() {
  return useContext(ApplicationButtonContext);
}

export function getApplicationButtonLabel(hasApplication: boolean) {
  return hasApplication ? "Update application" : "Apply now";
}
