import useAuth from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect, ReactNode } from "react";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function GP() {
  const navigate = useNavigate();
  const [activityList, setActivityList] = useState<any[]>([]);
  const [activity, setActivity] = useState<string>("");

  const questionMapper: { [key: string]: ReactNode } = {
    "How LONG did they take? (In SECONDS)": (
      <Input type="number" id="number" placeholder="Time Taken in Seconds" />
    ),
    "How ACCURATE was the team? (From 1 to 10 [Most Accurate])": (
      <Input
        type="number"
        id="number"
        placeholder="Accuracy Score for team"
        min={1}
        max={10}
      />
    ),
  };

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
    async function getGroups() {
      const { data, error } = await supabase.from("foc_group").select();
      if (error) {
        console.log(error);
      }
      if (!data) {
        return;
      }
      console.log(data);
    }

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
      setActivityList(data);
    }

    getGames();
    getGroups();
  }, []);

  return (
    <div className="w-full max-w-sm mx-auto h-full px-3 py-6 flex flex-col gap-5">
      <div className="grid w-full max-w-sm items-center gap-2">
        <Label htmlFor="test">Activity</Label>
        <Select
          onValueChange={(value) => {
            if (value) {
              setActivity(value);
            }
          }}
        >
          <SelectTrigger className="w-full" id="test">
            <SelectValue placeholder="Select Activity" />
          </SelectTrigger>
          <SelectContent>
            {activityList &&
              activityList.map((e, idx) => {
                console.log(e);
                return (
                  <SelectItem value={e.name} key={`activityList${idx}`}>
                    {e.name}
                  </SelectItem>
                );
              })}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-6 pt-6">
        <div className="text-xl font-bold">
          {activity &&
            activityList.filter((e) => e.name == activity)[0].question}
        </div>
        {activity &&
          questionMapper[
            activityList.filter((e) => e.name == activity)[0].question
          ]}
        {activity && <Button className="mx-auto px-6">Submit</Button>}
      </div>
    </div>
  );
}

export default GP;
