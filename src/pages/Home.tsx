import { Button } from "@/components/ui/button";
import useAuth from "@/hooks/useAuth";
import { useEffect } from "react";

function Home() {
  const { auth, logout, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      console.log(auth);
    }
  }, []);

  return (
    <div>
      <Button variant={"destructive"} onClick={() => logout()}>
        Logout
      </Button>
    </div>
  );
}
export default Home;
