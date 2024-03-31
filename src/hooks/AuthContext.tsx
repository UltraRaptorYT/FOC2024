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
};

export const AuthContext = createContext<AuthContextType>({
  auth: null,
  setAuth: () => null,
});

export const AuthProvider = ({ children }: Props) => {
  const [auth, setAuth] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function getAuth() {
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
        if (error || data.length == 0) {
          localStorage.removeItem("user");
          return navigate("/login");
        }
        setAuth(userData);
      }
    }

    getAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
