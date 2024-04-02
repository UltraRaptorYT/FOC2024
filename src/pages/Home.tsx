import { supabase } from "@/utils/supabase";
import { Trophy } from "lucide-react";
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

type Leaderboard = {
  group_name: string;
  total_points: number;
};

function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<Leaderboard[]>([]);

  const getLeaderboard = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.rpc("get_foc_leaderboard");

      if (error) {
        throw error;
      }

      if (!data) {
        return;
      }

      setLeaderboard(data);
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getLeaderboard();
  }, []);

  return (
    <main className="min-h-[100dvh] bg-white flex flex-col items-center justify-around">
      <div className="flex flex-col">
        <h1 className="text-2xl text-center font-light">SOC FOC 24'</h1>
        <h1 className="text-3xl text-center text-purple-900 tracking-wide font-bold">
          BLINK IN TIME
        </h1>
      </div>

      <div className="flex flex-col w-full items-center space-y-8">
        <div className="flex items-end justify-center max-w-sm w-full">
          <div className="flex flex-col items-center flex-1">
            <h1
              className={cn([
                "w-24 h-12 overflow-auto text-center font-bold text-xl",
                !isLoading && "animate-appear-2",
              ])}
            >
              {isLoading ? "Loading..." : leaderboard[1].group_name ?? "NA"}
            </h1>
            <div className="border-black border-b-0 bg-purple-600 pb-16 w-full relative">
              <div className="px-2 py-5 bg-slate-100 rounded-full m-8">
                <Trophy className="w-full stroke-gray-400" />
              </div>

              <div className="bg-purple-700 w-full h-2 absolute -top-1"></div>
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
            <div className="border-black border-b-0 bg-purple-700 pb-32 w-full relative">
              <div className="px-2 py-5 bg-yellow-100 rounded-full m-8">
                <Trophy className="w-full stroke-yellow-400" />
              </div>

              <div className="bg-purple-800 w-full h-2 absolute -top-1"></div>
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
          </div>
        </div>

        <div className="flex items-center justify-center w-full max-w-sm">
          <Table className="w-full">
            {leaderboard.length < 3 ? (
              <TableCaption>
                There are no other ranks at this time.
              </TableCaption>
            ) : (
              <TableCaption>Current standing for SOC FOC 24'</TableCaption>
            )}
            <TableHeader>
              <TableRow>
                <TableHead className="w-[24px]">Rank</TableHead>
                <TableHead>Group Name</TableHead>
                <TableHead className="text-center">Total Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(leaderboard.splice(2, leaderboard.length) ?? []).map(
                (leader, index) => (
                  <LeaderboardRow key={index} {...leader} index={index} />
                )
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </main>
  );
}

const LeaderboardRow = ({
  group_name,
  total_points,
  index,
}: Leaderboard & { index: number }) => {
  const rank = index + 4;
  return (
    <TableRow>
      <TableCell className="text-center">
        <h1 className="bg-purple-100 text-purple-800 py-2 px-3 font-bold rounded-full">
          {rank}
        </h1>
      </TableCell>
      <TableCell>{group_name}</TableCell>
      <TableCell className="text-center">{total_points}</TableCell>
    </TableRow>
  );
};
export default Home;
