import { supabase } from "@/utils/supabase";
import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type Props = {
  children: React.ReactNode;
};

export enum UserType {
  GL = "GL",
  GP = "GP",
  OC = "OC",
}

export type User = {
  admin: number;
  name: string;
  phone: number;
  type: UserType;
};

type AuthContextType = {
  auth: User | null;
  setAuth: React.Dispatch<React.SetStateAction<User | null>>;
  logout: () => void;
  login: (user: User) => void;
  isLoading: boolean;
};

export const AuthContext = createContext<AuthContextType>({
  auth: null,
  setAuth: () => null,
  logout: () => null,
  login: () => null,
  isLoading: false,
});

export const AuthProvider = ({ children }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [auth, setAuth] = useState<User | null>(null);
  const navigate = useNavigate();

  const logout = () => {
    setAuth(null);
    localStorage.removeItem("user");
    navigate("/login");
    return;
  };

  const login = (user: User) => {
    setAuth(user);
    localStorage.setItem("user", JSON.stringify(user));
    return;
  };

  useEffect(() => {
    async function getAuth() {
      try {
        setIsLoading(true);
        const storedUser = localStorage.getItem("user");

        if (storedUser) {
          const userData = JSON.parse(storedUser);

          const { data, error } = await supabase
            .from("foc_user")
            .select()
            .eq("admin", userData.admin)
            .eq("name", userData.name)
            .eq("type", userData.type)
            .eq("phone", userData.phone);

          if (data?.length === 0 || error) {
            throw new Error("User not found");
          }

          setAuth(userData);
          setIsLoading(false);
        }

      } catch (e) {
        logout();
      } 
    }

    getAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ auth, setAuth, logout, login, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
