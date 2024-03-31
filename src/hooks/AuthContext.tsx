import { createContext, useEffect, useState } from "react";

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

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      setAuth(JSON.parse(storedUser));
    }
  }, []);

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
