import useAuth from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

function OC() {
  const navigate = useNavigate();

  const { auth, isLoading } = useAuth();
  useEffect(() => {
    console.log(auth);
    if (!auth && !isLoading) {
      return navigate("/login");
    }
    if (auth && auth.type != "OC") {
      return navigate("/");
    }
  }, [auth, isLoading]);

  return (
    <div className="w-full max-w-sm mx-auto h-full p-3 flex flex-col">
      <div className="flex justify-between"></div>
    </div>
  );
}

export default OC;
