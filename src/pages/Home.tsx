import { supabase } from "@/utils/supabase";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useEffect, useState } from "react";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";

type Leaderboard = {
  group_id?: number;
  group_name: string;
  total_points: number;
};

function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<Leaderboard[]>([]);
  const [freeze, setFreeze] = useState(false);

  async function getFreeze() {
    const { data, error } = await supabase
      .from("foc_state")
      .select()
      .eq("name", "freeze");
    if (error) {
      console.log(error);
      return;
    }
    if (!data) {
      return;
    }
    return {
      freeze: data[0].state == "true",
      freezeDate: new Date(data[0].created_at),
    };
  }

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

  const activityMapper: { [key: number]: "rank" | "rank2" | "add" | "short" } =
    {
      1: "rank",
      2: "short",
      3: "rank",
      4: "rank",
      5: "rank",
      6: "rank",
      7: "rank",
      8: "rank",
      9: "rank",
      10: "add",
      11: "add",
      12: "add",
      13: "rank2",
      14: "rank2",
      15: "rank2",
      16: "add",
    };

  const getLeaderboard = async () => {
    try {
      const groups = await getGroups();
      console.log(groups);
      setIsLoading(true);
      const freezeObj = await getFreeze();

      if (!freezeObj) {
        throw "Freeze";
      }

      setFreeze(freezeObj.freeze);

      const freezeDateTimeStamp = new Date(
        freezeObj.freezeDate.getTime() -
          freezeObj.freezeDate.getTimezoneOffset() * 60000
      );
      console.log(freezeDateTimeStamp);
      let { data, error } = await supabase
        .from("foc_points")
        .select("*, foc_user(*), foc_group(*), foc_game(*)")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      if (!data) {
        return;
      }

      data = data.filter((e) => {
        return new Date(e.created_at) < freezeObj.freezeDate;
      });

      const groupedData = data.reduce((acc, obj) => {
        const key = `${obj.group}-${obj.game}`;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(obj);
        return acc;
      }, {});

      console.log(groupedData);

      const checkingData: { [key: number]: any } = {};

      const groupedArray = Object.entries(groupedData).map(([key, value]) => ({
        group: parseInt(key.split("-")[0]),
        game: parseInt(key.split("-")[1]),
        max: (value as { point: number }[]).reduce((max, obj) =>
          max.point > obj.point ? max : obj
        ).point,
        min: (value as { point: number }[]).reduce((min, obj) =>
          min.point < obj.point ? min : obj
        ).point,
      }));

      const gameData: { [key: number]: any[] } = {};

      groupedArray.forEach((entry) => {
        const groupNumber = entry.game;
        if (!gameData[groupNumber]) {
          gameData[groupNumber] = [];
        }
        gameData[groupNumber].push(entry);
      });

      console.log(gameData);

      const leaderboardDict: { [key: string]: number } = {};

      for (let group of groups) {
        let currentScore = 0;
        checkingData[group.id as number] = {};
        for (let row of data) {
          if (checkingData[group.id][row.game] == undefined) {
            checkingData[group.id][row.game] = [];
          }
          let point = 0;
          if (row.group != group.id) continue;
          let mapped = activityMapper[row.game as number];
          if (mapped == "add") {
            point = row.point;
            currentScore += point;
          } else if (mapped == "rank") {
            let pointArr = [10, 8, 6, 4, 2, 1];
            let gamePoint = [
              ...new Set(
                gameData[row.game]
                  .map((e) => {
                    return e.max;
                  })
                  .sort((a, b) => a - b)
              ),
            ];
            let index = gamePoint.findIndex((e) => e == row.point);
            if (index > pointArr.length - 1) {
              point = pointArr[pointArr.length - 1];
            } else {
              point = pointArr[index];
            }
            // console.log(point);
            // console.log(gameData[row.game].sort((a, b) => a.max - b.max));
          } else if (mapped == "rank2") {
            let pointArr = [15, 10, 7, 4];
            let gamePoint = [
              ...new Set(
                gameData[row.game]
                  .map((e) => {
                    return e.max;
                  })
                  .sort((a, b) => a - b)
              ),
            ];
            let index = gamePoint.findIndex((e) => e == row.point);
            if (index > pointArr.length - 1) {
              point = pointArr[pointArr.length - 1];
            } else {
              point = pointArr[index];
            }
          } else if (mapped == "short") {
            let pointArr = [10, 8, 6, 4, 2, 1];
            let gamePoint = [
              ...new Set(
                gameData[row.game]
                  .map((e) => {
                    return e.max;
                  })
                  .sort((a, b) => b - a)
              ),
            ];
            let index = gamePoint.findIndex((e) => e == row.point);
            if (index > pointArr.length - 1) {
              point = pointArr[pointArr.length - 1];
            } else {
              point = pointArr[index];
            }
          }
          // } else if (mapped == "short") {
          // console.log(row, point);
          checkingData[group.id][row.game].push(point);
        }
        // let group = groups.
        leaderboardDict[
          groups.filter((e) => e.id == group.id)[0].name as string
        ] = currentScore;
      }

      for (let [game_id, game] of Object.entries(gameData)) {
        // console.log(game_id, game);
        let game_type = activityMapper[Number(game_id)];
        // console.log(game_type);
        if (game_type == "add") {
          continue;
        }

        let point = 0;
        let count = 0;
        for (let group of game) {
          count++;
          if (game_type == "rank") {
            let pointArr = [10, 8, 6, 4, 2, 1];
            let gamePoint = [
              ...new Set(
                game
                  .map((e) => {
                    return e.max;
                  })
                  .sort((a, b) => a - b)
              ),
            ];
            let index = gamePoint.findIndex((e) => e == group.max);
            if (index > pointArr.length - 1) {
              point = pointArr[pointArr.length - 1];
            } else {
              point = pointArr[index];
            }
          } else if (game_type == "rank2") {
            let pointArr = [15, 10, 7, 4];
            let gamePoint = [
              ...new Set(
                game
                  .map((e) => {
                    return e.max;
                  })
                  .sort((a, b) => a - b)
              ),
            ];
            let index = gamePoint.findIndex((e) => e == group.max);
            if (index > pointArr.length - 1) {
              point = pointArr[pointArr.length - 1];
            } else {
              point = pointArr[index];
            }
          } else if (game_type == "short") {
            let pointArr = [10, 8, 6, 4, 2, 1];
            let gamePoint = [
              ...new Set(
                game
                  .map((e) => {
                    return e.max;
                  })
                  .sort((a, b) => b - a)
              ),
            ];
            let index = gamePoint.findIndex((e) => e == group.max);
            if (index > pointArr.length - 1) {
              point = pointArr[pointArr.length - 1];
            } else {
              point = pointArr[index];
            }
          }
          leaderboardDict[
            groups.filter((e) => e.id == group.group)[0].name as string
          ] += point;
          // leaderboardDict[group.name as string] += point;
        }
      }

      console.log(checkingData);
      console.log(leaderboardDict);
      const result = Object.entries(leaderboardDict).map(
        ([groupName, score]) => ({
          group_name: groupName,
          total_points: score,
        })
      );
      result.sort((a, b) => {
        return b.total_points - a.total_points;
      });
      const finalLeaderboard = result.map((e, idx) => {
        let final: Leaderboard = { ...e };
        final.group_id = groups.filter((i) => i.name == e.group_name)[0]["id"];
        return final;
      });
      setLeaderboard(finalLeaderboard);
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
    // try {
    //   setIsLoading(true);
    //   const { data, error } = await supabase.rpc("get_foc_leaderboard");

    //   if (error) {
    //     throw error;
    //   }

    //   if (!data) {
    //     return;
    //   }

    //   setLeaderboard(data);
    // } catch (e) {
    //   console.log(e);
    // } finally {
    //   setIsLoading(false);
    // }
  };

  // async function getFreeze() {
  //   const { data, error } = await supabase
  //     .from("foc_state")
  //     .select()
  //     .eq("name", "freeze");
  //   if (error) {
  //     console.log(error);
  //     return;
  //   }
  //   if (!data) {
  //     return;
  //   }
  //   return setFreeze(data[0].state == "true");
  // }

  useEffect(() => {
    const channel = supabase
      .channel("table-db-changes")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "foc_state" },
        (payload) => {
          console.log("Change received!", payload);
          getLeaderboard();
          return;
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "foc_group" },
        (payload) => {
          console.log("Change received!", payload);
          getLeaderboard();
          return;
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "foc_points" },
        (payload) => {
          console.log("Change received!", payload);
          getLeaderboard();
          return;
        }
      )
      .subscribe();

    getLeaderboard();
    return () => {
      channel.unsubscribe();
    };
  }, []);

  return (
    <main className="min-h-[100dvh] bg-white flex flex-col space-y-6 items-center justify-around w-full max-w-sm mx-auto">
      <div className="flex flex-col pt-12">
        <h1 className="text-2xl text-center font-light">SOC FOC 24'</h1>
        <h1 className="text-3xl text-center text-purple-900 tracking-wide font-bold">
          BLINK IN TIME
        </h1>
      </div>

      <img
        src="/leaderboard/delorean.svg"
        alt="machine"
        className="max-w-sm w-full animate-float px-12"
      />

      {freeze && (
        <div className="w-full px-4">
          <Alert className="w-full">
            <Info className="h-4 w-4 stroke-red-600" />
            <AlertTitle>Attention</AlertTitle>
            <AlertDescription>
              The leaderboard is currently frozen.
            </AlertDescription>
          </Alert>
        </div>
      )}

      <div className="flex flex-col w-full items-center space-y-8">
        {/* <div className="flex items-end justify-center max-w-sm w-full px-2"> */}
        {/* <div className="flex flex-col items-center flex-1">
            <h1
              className={cn([
                "w-24 h-12 overflow-auto text-center font-bold text-xl",
                !isLoading && "animate-appear-2",
              ])}
            >
              {isLoading ? "Loading..." : leaderboard[1].group_name ?? "NA"}
            </h1>
            <div className="border-black border-b-0 bg-purple-600 pb-10 w-full relative">
              <div className="px-2 py-5 bg-slate-100 rounded-full m-8">
                <Trophy className="w-full stroke-gray-400" />
              </div>

              <div className="bg-purple-700 w-full h-2 absolute -top-1"></div>
            </div>

            <div className="bg-purple-600 w-full flex items-center justify-center pb-6">
              <h1 className="px-6 py-1 bg-slate-100 text-sm text-gray-400">
                {isLoading ? "Loading..." : leaderboard[1].total_points ?? "NA"}{" "}
                Pts
              </h1>
            </div>
          </div>
          <div className="flex flex-col items-center flex-1">
            <h1
              className={cn([
                "w-24 h-12 overflow-auto text-center font-bold text-2xl",
                !isLoading && "animate-appear-3",
              ])}
            >
              {isLoading ? "Loading..." : leaderboard[0].group_name ?? "NA"}
            </h1>
            <div className="border-black border-b-0 bg-purple-700 pb-24 w-full relative">
              <div className="px-2 py-5 bg-yellow-100 rounded-full m-8">
                <Trophy className="w-full stroke-yellow-500" />
              </div>

              <div className="bg-purple-800 w-full h-2 absolute -top-1"></div>
            </div>

            <div className="bg-purple-700 w-full flex items-center justify-center pb-8">
              <h1 className="px-6 py-1 bg-yellow-100 text-sm text-yellow-500">
                {isLoading ? "Loading..." : leaderboard[0].total_points ?? "NA"} Pts
              </h1>
            </div>
          </div>
          <div className="flex flex-col items-center flex-1">
            <h1
              className={cn([
                "w-24 h-12 overflow-auto text-center font-bold text-lg",
                !isLoading && "animate-appear-1",
              ])}
            >
              {isLoading ? "Loading..." : leaderboard[2].group_name ?? "NA"}
            </h1>
            <div className="border-black border-b-0 bg-purple-500 w-full relative">
              <div className="px-2 py-5 bg-[#B08D57] bg-opacity-75 rounded-full m-8">
                <Trophy className="w-full stroke-[#FFD700]" />
              </div>

              <div className="bg-purple-600 w-full h-2 absolute -top-1"></div>
            </div>

            <div className="bg-purple-500 w-full flex items-center justify-center pb-4">
              <h1 className="px-6 py-1 bg-[#B08D57] text-sm text-[#FFD700]">
                {isLoading ? "Loading..." : leaderboard[2].total_points ?? "NA"}{" "}
                Pts
              </h1>
            </div>
          </div> */}
        {/* </div> */}

        <div className="flex items-center justify-center w-full max-w-sm pb-12 px-4">
          <Table className="w-full">
            <TableCaption>
              {isLoading
                ? "Loading Leaderboard..."
                : "Current standing for SOC FOC 24'"}
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[24px] text-black">Rank</TableHead>
                <TableHead className="text-black px-1">Group Name</TableHead>
                <TableHead className="text-center text-black">
                  Total Points
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!isLoading &&
                (leaderboard ?? []).map((leader, index) => (
                  <LeaderboardRow key={index} {...leader} index={index} />
                ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </main>
  );
}

const LeaderboardRow = ({
  group_id,
  group_name,
  total_points,
  index,
}: Leaderboard & { index: number }) => {
  // const rank = total_points === 0 ? "NA" : index + 1;
  const rank = index + 1;
  return (
    <TableRow>
      <TableCell className="text-center">
        <h1
          className={cn([
            "h-8 w-8 grid place-items-center font-bold rounded-full",
            rank === 1
              ? "bg-[#FFD700] text-yellow-800"
              : rank === 2
              ? "bg-[#C0C0C0] text-gray-700"
              : rank === 3
              ? "bg-[#B8860B] text-yellow-200"
              : // : rank === "NA"
                // ? "italic"
                "bg-purple-100 text-purple-800",
          ])}
        >
          {rank}
        </h1>
      </TableCell>
      <TableCell
        className={cn([
          "px-1",
          rank === 1 && "text-[#FFD700] font-bold",
          rank === 2 && "text-[#C0C0C0] font-bold",
          rank === 3 && "text-[#B8860B] font-bold",
        ])}
      >
        <span className="font-bold">{"Group " + group_id + ": "}</span>
        {group_name}
      </TableCell>
      <TableCell
        className={cn([
          "text-center",
          rank === 1 && "text-[#FFD700] font-bold",
          rank === 2 && "text-[#C0C0C0] font-bold",
          rank === 3 && "text-[#B8860B] font-bold",
        ])}
      >
        {total_points}
      </TableCell>
    </TableRow>
  );
};
export default Home;
