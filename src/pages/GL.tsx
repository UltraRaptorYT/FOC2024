import useAuth from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import dayjs from "dayjs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Group = {
  id: number;
  name: string;
  created_at: string;
};

function GL() {
  const { auth, isLoading } = useAuth();
  const navigate = useNavigate();
  const [groupData, setGroupData] = useState<Group | null>(null);
  const [groupDataLoading, setGroupDataLoading] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  const handleNameChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateGroupName();
  };

  const updateGroupName = async () => {
    try {
      if (groupData?.name === newGroupName) {
        return toast.error(
          "New Group Name is the same as the current name, please enter a new name."
        );
      }

      const { error } = await supabase
        .from("foc_group")
        .update({
          name: newGroupName,
        } as Group)
        .eq("id", groupData?.id);

      if (error) {
        throw error;
      }

      getGroupData();
      toast.success(
        `Group ${groupData?.id}'s name has successfully been changed to "${newGroupName}"!`
      );
    } catch (e) {
      toast.error(
        `Failed to change Group name to "${newGroupName}", please inform OC.`
      );
      console.log(e);
    }
  };

  const getGroupData = async () => {
    setGroupDataLoading(true);
    try {
      const { data, error } = await supabase.rpc("get_og", {
        admin: auth?.admin,
      });

      if (error) {
        throw error;
      }

      setGroupData(data[0]);
      setNewGroupName(data[0].name);
    } catch (e) {
      console.log(e);
    } finally {
      setGroupDataLoading(false);
    }
  };

  useEffect(() => {
    if (!auth && !isLoading) {
      return navigate("/login");
    }
    if (auth && !(auth.type == "GL" || auth.type == "OC")) {
      return navigate("/");
    }

    if (auth && !isLoading) getGroupData();
  }, [auth, isLoading]);

  return (
    <div className="flex flex-col items-center justify-start py-8 w-full min-h-[100dvh] h-full">
      <h1 className="text-3xl font-semibold">
        Hi, <span className="text-purple-800">{auth?.name}!</span>
      </h1>

      <main className="max-w-sm w-full flex flex-col px-4">
        {!groupDataLoading && (
          <div className="border p-4 rounded-lg shadow-md mt-8 w-full text-xl">
            <h1 className="text-center">
              You are the GL of{" "}
              <span className="font-bold">Group {groupData?.id}</span>
              🔥
            </h1>

            <form
              onSubmit={handleNameChange}
              className="pt-8 flex flex-col space-y-4"
            >
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="currentName">
                  <span className="font-bold">Current</span> Group Name
                </Label>
                <Input
                  type="text"
                  id="currentName"
                  value={groupData?.name}
                  disabled
                />
                <Label className="text-xs text-gray-500 font-light">
                  Created on{" "}
                  {dayjs(groupData?.created_at).format(
                    "DD MMM YYYY, hh:mm:ss a"
                  )}
                </Label>
              </div>

              <div className="grid w-full max-w-sm items-center gap-1.5 pb-4">
                <Label htmlFor="currentName">
                  <span className="font-bold">New</span> Group Name
                </Label>
                <Input
                  type="text"
                  id="currentName"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                />
              </div>
              <Button
                className="bg-purple-800 hover:bg-purple-900"
                type="submit"
              >
                Change Group Name
              </Button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

export default GL;
