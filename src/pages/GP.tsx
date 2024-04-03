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
import LengthQuestion from "@/components/LengthQuestion";
import AccurateQuestion from "@/components/AccurateQuestion";
import ItemQuestion from "@/components/ItemQuestion";
import ApocalypseQuestion from "@/components/ApocalypseQuestion";
import TeamScoreQuestion from "@/components/TeamScoreQuestion";
import Logout from "@/components/Logout";
import { cn } from "@/lib/utils";

function GP() {
  const navigate = useNavigate();
  const [activityList, setActivityList] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [activity, setActivity] = useState<string>("");
  const { auth, isLoading } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);

  const activityMapper: { [key: string]: ReactNode } = {
    "Memory Sports Club": (
      <LengthQuestion
        groups={groups}
        auth={auth}
        min={1}
        activity_id={1}
      ></LengthQuestion>
    ),
    "Broken Communications": (
      <AccurateQuestion
        groups={groups}
        auth={auth}
        min={1}
        max={10}
        activity_id={2}
      ></AccurateQuestion>
    ),
    "Guide The Lost": (
      <LengthQuestion
        groups={groups}
        auth={auth}
        min={1}
        activity_id={3}
      ></LengthQuestion>
    ),
    "AHHHHH BOMBS!": (
      <LengthQuestion
        groups={groups}
        auth={auth}
        min={1}
        activity_id={4}
      ></LengthQuestion>
    ),
    "Hushed Odyssey": (
      <LengthQuestion
        groups={groups}
        auth={auth}
        min={1}
        activity_id={5}
      ></LengthQuestion>
    ),
    "Radioactive Relay": (
      <LengthQuestion
        groups={groups}
        auth={auth}
        min={1}
        activity_id={6}
      ></LengthQuestion>
    ),
    "Zoom In, Zoom Out": (
      <LengthQuestion
        groups={groups}
        auth={auth}
        min={1}
        activity_id={7}
      ></LengthQuestion>
    ),
    "Language Decipher": (
      <LengthQuestion
        groups={groups}
        auth={auth}
        min={1}
        activity_id={8}
      ></LengthQuestion>
    ),
    "Scavenger Odyssey": (
      <ItemQuestion
        groups={groups}
        auth={auth}
        min={1}
        activity_id={9}
      ></ItemQuestion>
    ),
    Dodgeball: (
      <TeamScoreQuestion
        groups={groups}
        auth={auth}
        activity_id={10}
      ></TeamScoreQuestion>
    ),
    "Captain's Ball": (
      <TeamScoreQuestion
        groups={groups}
        auth={auth}
        activity_id={11}
      ></TeamScoreQuestion>
    ),
    Apocalypse: (
      <ApocalypseQuestion
        groups={groups}
        auth={auth}
        activity_id={12}
      ></ApocalypseQuestion>
    ),
    "Safeguarding The Blueprints": (
      <LengthQuestion
        groups={groups}
        auth={auth}
        min={1}
        activity_id={13}
      ></LengthQuestion>
    ),
    "Leaky Pipes": (
      <LengthQuestion
        groups={groups}
        auth={auth}
        min={1}
        activity_id={14}
      ></LengthQuestion>
    ),
    "Water Dunk": (
      <LengthQuestion
        groups={groups}
        auth={auth}
        min={1}
        activity_id={15}
      ></LengthQuestion>
    ),
  };

  function normalise_date(date: string) {
    let timestamp = new Date(date);
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "long",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    };
    const formattedTimestamp = timestamp.toLocaleDateString("en-UK", options);
    return formattedTimestamp;
  }

  useEffect(() => {
    console.log(auth);
    if (!auth && !isLoading) {
      return navigate("/login");
    }
    if (auth && !(auth.type == "GP" || auth.type == "OC")) {
      return navigate("/");
    }
  }, [auth, isLoading]);

  async function getLogs(game_name: string) {
    const { data, error } = await supabase
      .from("foc_points")
      .select("*, foc_user(*), foc_group(*), foc_game(*)")
      .order("created_at", { ascending: false });
    console.log(data);
    // const { data, error } = await supabase
    //   .from("foc_points")
    //   .select("*, foc_user(*), foc_group(*), foc_game(*)")
    //   .order("created_at", { ascending: false })
    //   .eq("foc_user.admin", 2100775);
    if (error) {
      console.log(error);
      return;
    }
    if (!data) {
      return;
    }
    let available = data?.filter((e) => e.foc_game.name == game_name);
    console.log(available);
    setLogs(available);
  }

  useEffect(() => {
    async function getGroups(): Promise<any[]> {
      const { data, error } = await supabase
        .from("foc_group")
        .select()
        .order("id", { ascending: true });
      if (error) {
        console.log(error);
      }
      if (!data) {
        return [];
      }
      return data;
    }

    async function getGameState() {
      const { data, error } = await supabase
        .from("foc_state")
        .select()
        .eq("name", "game");
      if (error) {
        console.log(error);
        return;
      }
      if (!data) {
        return;
      }
      return data[0].state.split("|");
    }

    async function getGames() {
      const groups = await getGroups();
      const gameState = await getGameState();
      const { data, error } = await supabase
        .from("foc_game")
        .select()
        .in("day", gameState)
        .order("id", { ascending: true });
      console.log(data);
      if (error) {
        console.log(error);
      }
      if (!data) {
        return;
      }
      setActivityList(data);
      setGroups(groups);
    }

    const channel = supabase
      .channel("table-db-changes")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "foc_group" },
        (payload) => {
          console.log("Change received!", payload);
          getGames();
          return;
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "foc_state" },
        (payload) => {
          console.log("Change received!", payload);
          getGames();
          return;
        }
      )
      .subscribe();

    getGames();
    return () => {
      channel.unsubscribe();
    };
  }, []);

  return (
    <div className="w-full max-w-sm mx-auto h-full px-3 py-8 flex flex-col gap-5">
      <Logout />
      <div className="grid w-full max-w-sm items-center gap-2">
        <Label htmlFor="test" className="text-xl font-bold">
          Activity
        </Label>
        <Select
          onValueChange={(value) => {
            if (value) {
              setActivity(value);
              getLogs(value);
            }
          }}
        >
          <SelectTrigger className="w-full" id="test">
            <SelectValue placeholder="Select Activity" />
          </SelectTrigger>
          <SelectContent>
            {activityList &&
              activityList.map((e, idx) => {
                return (
                  <SelectItem value={e.name} key={`activityList${idx}`}>
                    {e.name}
                  </SelectItem>
                );
              })}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-6 pt-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-center font-bold text-2xl text-purple-800">
            {activity}
          </h1>
          <div className="text-xl text-center">
            {activity &&
              activityList.filter((e) => e.name == activity)[0]?.question}
          </div>
        </div>
        {activity && activityMapper[activity]}
        {activity && (
          <div>
            <div id="logs" className="pb-5 overflow-hidden h-[200px]">
              <h1 className="text-xl font-bold pb-2">
                Logs
                <span className="ml-4 text-sm italic text-red-600">
                  **Points are not exact
                </span>
              </h1>
              <div className="h-full space-y-0.5 overflow-scroll pb-5">
                {logs.map((e, idx) => {
                  return (
                    <div className="flex flex-col min-h-16 bg-white border rounded-lg p-4">
                      <div
                        className="flex flex-col justify-center"
                        key={"logs" + idx}
                      >
                        <div className="flex items-start justify-center space-x-4">
                          <div className="flex gap-x-1.5 flex-wrap text-sm w-full">
                            <span className="font-bold text-purple-800">
                              {e.foc_user.name}
                            </span>
                            has
                            <span
                              className={
                                e.point >= 0 ? "text-green-600" : "text-red-600"
                              }
                            >
                              {e.point >= 0 ? "awarded" : "penalised"}
                            </span>
                            <span className="font-bold">
                              {"Group " +
                                e.foc_group.id +
                                ": " +
                                e.foc_group.name}
                            </span>
                            {/* <span className="font-bold">
                        {(e.point >= 0 ? "+" : "") + e.point}
                      </span> */}
                            <span>for</span>
                            <span className="font-bold text-gray-500">
                              {e.foc_game.name}
                            </span>
                          </div>
                          <span
                            className={cn([
                              "font-bold",
                              e.point >= 0 ? "text-green-600" : "text-red-600",
                            ])}
                          >
                            {(e.point >= 0 ? "+" : "") + e.point}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-right">
                          {normalise_date(e.created_at)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default GP;
