import { Button } from "@/components/ui/button";
import useAuth from "@/hooks/useAuth";
import { useEffect } from "react";

function Home() {
  const { auth, logout, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !auth) {
      logout();
    }
  }, [auth, isLoading]);

  return (
    <div>
      <Button variant={"destructive"} onClick={() => logout()} className="">
        Logout
      </Button>
    </div>
  );
}
export default Home;
