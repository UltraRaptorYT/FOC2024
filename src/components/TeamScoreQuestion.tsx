import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@radix-ui/react-label";
import { User } from "@/hooks/AuthContext";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/utils/supabase";

function TeamScoreQuestion({
  groups,
  auth,
  activity_id,
}: {
  groups: any[];
  auth: User | null;
  activity_id: number;
}) {
  const [winnerGroup, setWinnerGroup] = useState<string>();
  const [loserGroup, setLoserGroup] = useState<string>();

  function checkGroup(
    group: string | undefined,
    type: "Winner" | "Loser"
  ): boolean {
    if (!group) {
      toast.warning(`No ${type} Group selected`);
      return false;
    }
    return true;
  }

  async function submitForm() {
    let winnerGroupValidation = checkGroup(winnerGroup, "Winner");
    let loserGroupValidation = checkGroup(loserGroup, "Loser");
    if (!(winnerGroupValidation && loserGroupValidation && auth)) {
      return;
    }
    const { data, error } = await supabase
      .from("foc_points")
      .insert([
        {
          user: auth.admin,
          group: winnerGroup,
          game: activity_id,
          point: 10,
        },
      ])
      .select();
    if (error || !data) {
      console.log(error);
      toast.error("Internal Server Error");
      return;
    }
    if (data.length) {
      return toast.success("Added points");
    }
  }

  return (
    <>
      <div className="grid w-full max-w-sm items-center gap-2">
        <Label htmlFor="winner" className="text-lg font-bold">
          Winner Group
        </Label>
        <Select
          onValueChange={(value) => {
            if (value) {
              setWinnerGroup(value);
            }
          }}
          value={winnerGroup}
        >
          <SelectTrigger className="w-full" id="winner">
            <SelectValue placeholder="Select winner group" />
          </SelectTrigger>
          <SelectContent>
            {groups.map((e) => {
              return (
                <SelectItem value={e.id} key={"Group" + e.id}>
                  {"Group " + e.id + ": " + e.name}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
      <h1 className="text-center text-2xl font-bold">VS</h1>
      <div className="grid w-full max-w-sm items-center gap-2">
        <Label htmlFor="loser" className="text-lg font-bold">
          Loser Group
        </Label>
        <Select
          onValueChange={(value) => {
            if (value) {
              setLoserGroup(value);
            }
          }}
          value={loserGroup}
        >
          <SelectTrigger className="w-full" id="loser">
            <SelectValue placeholder="Select loser group" />
          </SelectTrigger>
          <SelectContent>
            {groups.map((e) => {
              return (
                <SelectItem value={e.id} key={"Group" + e.id}>
                  {"Group " + e.id + ": " + e.name}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
      <Button className="mx-auto px-6" onClick={() => submitForm()}>
        Submit
      </Button>
    </>
  );
}

export default TeamScoreQuestion;
