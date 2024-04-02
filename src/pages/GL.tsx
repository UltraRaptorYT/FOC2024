import useAuth from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

function GL() {
  const navigate = useNavigate();

  const { auth, isLoading } = useAuth();
  useEffect(() => {
    console.log(auth);
    if (!auth && !isLoading) {
      return navigate("/login");
    }
    if (auth && !(auth.type == "GL" || auth.type == "OC")) {
      return navigate("/");
    }
  }, [auth, isLoading]);

  return <div>GL</div>;
}

export default GL;
