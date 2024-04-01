import useAuth from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/utils/supabase";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@radix-ui/react-label";
import { useState } from "react";

function GP() {
  const navigate = useNavigate();
  const [activity, setActivity] = useState<any[]>([]);

  const { auth, isLoading } = useAuth();
  useEffect(() => {
    console.log(auth);
    if (!auth && !isLoading) {
      return navigate("/login");
    }
    if (auth && auth.type != "GP") {
      return navigate("/");
    }
  }, [auth, isLoading]);

  useEffect(() => {
    async function getGameState() {
      const { data, error } = await supabase
        .from("foc_state")
        .select()
        .eq("name", "game");
      if (error) {
        console.log(error);
      }
      if (!data) {
        return;
      }
      return data[0].state.split("|");
    }
    async function getGames() {
      const gameState = await getGameState();
      const { data, error } = await supabase
        .from("foc_game")
        .select()
        .in("day", gameState);
      if (error) {
        console.log(error);
      }
      if (!data) {
        return;
      }
      setActivity(data);
    }

    getGames();
  }, []);

  return (
    <div className="w-full max-w-sm mx-auto h-full p-3 flex flex-col">
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="test">Activity</Label>
        <Select>
          <SelectTrigger className="w-full" id="test">
            <SelectValue placeholder="Select Activity" />
          </SelectTrigger>
          <SelectContent>
            {activity &&
              activity.map((e, idx) => {
                console.log(e);
                return (
                  <SelectItem value={e.name} key={`activity${idx}`}>
                    {e.name}
                  </SelectItem>
                );
              })}
            {/* <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="system">System</SelectItem> */}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export default GP;
