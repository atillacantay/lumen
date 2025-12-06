import {
  registerForPushNotificationsAsync,
  savePushToken,
} from "@/services/notification-service";
import { getOrCreateUser } from "@/services/user-service";
import { User } from "@/types";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface UserContextType {
  user: User | null;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType>({
  user: null,
  isLoading: true,
});

export const useUser = () => useContext(UserContext);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const initUser = useCallback(async () => {
    try {
      const currentUser = await getOrCreateUser();
      setUser(currentUser);

      // Register for push notifications after user is created
      const token = await registerForPushNotificationsAsync();
      if (token) {
        await savePushToken(currentUser.id, token);
      }
    } catch {
      // Silently fail
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initUser();
  }, [initUser]);

  return (
    <UserContext.Provider value={{ user, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};
