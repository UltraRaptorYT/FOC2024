import useAuth from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { LogOut } from "lucide-react";
import React from "react";

type Props = {
  className?: string;
};

const Logout = ({ className }: Props) => {
  const { logout } = useAuth();
  return (
    <button
      className={cn([
        className,
        "px-2 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 right-3 bottom-3 fixed",
      ])}
      onClick={() => logout()}
    >
      <LogOut />
    </button>
  );
};

export default Logout;
