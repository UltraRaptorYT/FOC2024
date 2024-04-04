import useAuth from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { Switch } from "@headlessui/react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import dayjs from "dayjs";
import Logout from "@/components/Logout";
import { Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import Home from "./Home";

function OC() {
    const [logs, setLogs] = useState<any[]>([]);
    const navigate = useNavigate();
    const [freeze, setFreeze] = useState(false);
    const [groups, setGroups] = useState<any[]>([]);
    const [group, setGroup] = useState<string>();
    const [value, setValue] = useState<number | "">("");
    const [remarks, setRemarks] = useState<string>("");
    const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);

    const [day1Game, setDay1Game] = useState<boolean>(false);
    const [day2Game, setDay2Game] = useState<boolean>(false);
    const [scavenger, setScavenger] = useState<boolean>(false);

    const { auth, isLoading } = useAuth();

    function checkValue(value: number | ""): boolean {
        if (!value) {
            toast.warning(`Input value is invalid`);
            return false;
        }
        if (!Number.isInteger(value)) {
            toast.warning(`Input value is not an integer`);
            return false;
        }
        return true;
    }

    useEffect(() => {
        if (!auth && !isLoading) {
            return navigate("/login");
        }
        if (auth && auth.type != "OC") {
            return navigate("/");
        }
    }, [auth, isLoading]);

    async function confirmDelete(point_id: number) {
        console.log(point_id);
        const { error } = await supabase.from("foc_points").delete().eq("id", point_id);
        if (error) {
            console.log(error);
            return;
        }
        toast.success("Record removed");
    }

    async function getFreeze() {
        const { data, error } = await supabase.from("foc_state").select().eq("name", "freeze");
        if (error) {
            console.log(error);
            return;
        }
        if (!data) {
            return;
        }
        return setFreeze(data[0].state == "true");
    }

    async function getGameState() {
        const { data, error } = await supabase.from("foc_state").select().eq("name", "game");
        if (error) {
            console.log(error);
            return;
        }
        if (!data) {
            return;
        }
        console.log(data);
        return data[0].state.split("|");
    }

    function checkGroup(group: string | undefined): boolean {
        if (!group) {
            toast.warning(`No Group selected`);
            return false;
        }
        return true;
    }

    async function submitForm() {
        let groupValidation = checkGroup(group);
        let valueValidation = checkValue(value);
        if (!(groupValidation && valueValidation && auth)) {
            return;
        }
        const { data, error } = await supabase
            .from("foc_points")
            .insert([
                {
                    user: auth.admin,
                    group: group,
                    game: 16,
                    point: value,
                    remarks: remarks,
                },
            ])
            .select();
        if (error || !data) {
            console.log(error);
            toast.error("Internal Server Error");
            return;
        }
        if (data.length) {
            setRemarks("");
            setValue("");
            return toast.success("Points Added");
        }
    }

    async function updateGameState() {
        let state = [];
        if (day1Game) {
            state.push("1");
        }
        if (day2Game) {
            state.push("2");
        }
        if (scavenger) {
            state.push("1.5");
        }
        console.log(state);
        const { data, error } = await supabase
            .from("foc_state")
            .update({
                state: state.join("|"),
            })
            .eq("name", "game")
            .select();
        if (error) {
            console.log(error);
            return;
        }
        if (!data) {
            return;
        }
        console.log(data);
    }

    async function updateFreeze() {
        const { data, error } = await supabase
            .from("foc_state")
            .update({
                state: freeze ? "false" : "true",
                created_at: new Date(),
            })
            .eq("name", "freeze")
            .select();
        if (error) {
            console.log(error);
            return;
        }
        if (!data) {
            return;
        }
        console.log(data);
    }

    useEffect(() => {
        async function getLogs() {
            const { data, error } = await supabase.from("foc_points").select("*, foc_user(*), foc_group(*), foc_game(*)").order("created_at", { ascending: false });

            if (error) {
                console.log(error);
                return;
            }
            if (!data) {
                return;
            }
            const groups = await getGroups();
            setLogs(data);
            setGroups(groups);
            const gameState = await getGameState();
            console.log(gameState);
            if (gameState.includes("1")) {
                console.log("hi");
                setDay1Game(true);
            }
            if (gameState.includes("2")) {
                setDay2Game(true);
            }
            if (gameState.includes("1.5")) {
                setScavenger(true);
            }
        }

        const channel = supabase
            .channel("table-db-changes")
            .on("postgres_changes", { event: "UPDATE", schema: "public", table: "foc_group" }, (payload) => {
                console.log("Change received!", payload);
                getLogs();

                return;
            })
            .on("postgres_changes", { event: "*", schema: "public", table: "foc_points" }, (payload) => {
                console.log("Change received!", payload);
                getLogs();
                return;
            })
            .subscribe();

        getFreeze();
        getLogs();
        return () => {
            channel.unsubscribe();
        };
    }, []);

    // function normalise_date(date: string) {
    //   let timestamp = new Date(date);
    //   const options: Intl.DateTimeFormatOptions = {
    //     day: "numeric",
    //     month: "long",
    //     hour: "numeric",
    //     minute: "2-digit",
    //     hour12: true,
    //   };
    //   const formattedTimestamp = timestamp.toLocaleDateString("en-UK", options);
    //   return formattedTimestamp;
    // }

    async function getGroups(): Promise<any[]> {
        const { data, error } = await supabase.from("foc_group").select().order("id", { ascending: true });
        if (error) {
            console.log(error);
        }
        if (!data) {
            return [];
        }
        return data;
    }

    useEffect(() => {
        if (day1Game || day2Game || scavenger) updateGameState();
    }, [day1Game, day2Game, scavenger]);

    return (
        <div className="w-full max-w-sm mx-auto min-h-[100dvh] px-3 py-5 flex flex-col gap-5">
            <Logout />
            <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                    <div className="flex gap-2 flex-col">
                        <h1 className="text-xl font-bold">Activate Games</h1>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                className="data-[state=checked]:bg-purple-800 h-6 w-6 rounded-md"
                                id="day1Game"
                                checked={day1Game}
                                onCheckedChange={(e: boolean) => {
                                    setDay1Game(e);
                                }}
                            />
                            <label htmlFor="day1Game" className="font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Day 1 Games
                            </label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                className="data-[state=checked]:bg-purple-800 h-6 w-6 rounded-md"
                                id="scavenger"
                                checked={scavenger}
                                onCheckedChange={(e: boolean) => {
                                    setScavenger(e);
                                }}
                            />
                            <label htmlFor="scavenger" className="font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Scavenger Odyssey
                            </label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                className="data-[state=checked]:bg-purple-800 h-6 w-6 rounded-md"
                                id="day2Game"
                                checked={day2Game}
                                onCheckedChange={(e: boolean) => {
                                    setDay2Game(e);
                                }}
                            />
                            <label htmlFor="day2Game" className="font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Day 2 Games
                            </label>
                        </div>
                        <Switch.Group as="div" className="flex items-center pt-4">
                            <Switch
                                checked={freeze}
                                onChange={(e) => {
                                    setFreeze(e);
                                    updateFreeze();
                                }}
                                className={cn(
                                    freeze ? "bg-purple-800" : "bg-gray-200",
                                    "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
                                )}
                            >
                                <span
                                    aria-hidden="true"
                                    className={cn(
                                        freeze ? "translate-x-5" : "translate-x-0",
                                        "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                                    )}
                                />
                            </Switch>
                            <Switch.Label as="span" className="ml-3 text-sm">
                                <span className="font-medium text-gray-900">Freeze Leaderboard</span>
                            </Switch.Label>
                        </Switch.Group>
                    </div>
                </div>
                <Separator className="my-2" />
                <Button className="bg-purple-800 hover:bg-purple-900 flex items-center justify-center space-x-4 my-2" onClick={() => setShowLeaderboard(!showLeaderboard)}>
                    <h1>{showLeaderboard ? "Hide" : "Show"} Leaderboard</h1>
                </Button>
                {showLeaderboard && <Home />}
                <Separator className="my-2" />
                <div className="flex flex-col gap-2">
                    <h1 className="font-bold text-xl">Add/Remove Points</h1>
                    <Select
                        onValueChange={(value) => {
                            if (value) {
                                setGroup(value);
                            }
                        }}
                        value={group}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a group" />
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
                    <Input
                        onChange={(e) => {
                            let valueString = (e.target as HTMLInputElement).value;
                            if (valueString.length == 0) {
                                setValue("");
                            }
                            let value = Number(valueString);
                            let valueValidation = checkValue(value);
                            if (valueValidation) {
                                setValue(value);
                            }
                        }}
                        value={value == "" ? "" : value}
                        type="number"
                        id="number"
                        placeholder="Points Awarded/Deducted"
                    />
                    <Textarea placeholder="Additional Remarks (optional)" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
                </div>
                <Button
                    className="mx-auto px-6 bg-purple-800 hover:bg-purple-900 transition-colors mt-2 w-full"
                    onClick={() => {
                        submitForm();
                    }}
                >
                    Submit
                </Button>
            </div>

            <Separator className="my-2" />

            <div id="logs" className="pb-5 overflow-hidden h-[75dvh]">
                <h1 className="text-xl font-bold pb-2">
                    Logs
                    <span className="ml-4 text-sm italic text-red-600">**Score are for games not actual points</span>
                </h1>
                <div className="h-full space-y-2 overflow-scroll pb-5">
                    {logs.map((e, idx) => {
                        return (
                            <div className="flex flex-col min-h-16 bg-white border rounded-lg p-4">
                                <div className="flex flex-col justify-center" key={"logs" + idx}>
                                    <div className="flex items-start justify-center space-x-4">
                                        <div className="flex gap-x-1.5 flex-wrap text-sm w-full">
                                            <span className="font-bold text-purple-800 uppercase">{e.foc_user.name}</span>
                                            has
                                            <span className={cn([e.point >= 0 ? "text-green-600" : "text-red-600", "font-semibold"])}>
                                                {e.point >= 0 ? "awarded" : "penalised"}
                                            </span>
                                            <span className="font-bold">{"Group " + e.foc_group.id + ": " + e.foc_group.name}</span>
                                            {/* <span className="font-bold">
                        {(e.point >= 0 ? "+" : "") + e.point}
                      </span> */}
                                            <span>for</span>
                                            <span className="font-bold text-gray-500">{e.foc_game.name}</span>
                                        </div>
                                        <span className={cn(["font-bold", e.point >= 0 ? "text-green-600" : "text-red-600"])}>{(e.point >= 0 ? "+" : "") + e.point}</span>
                                    </div>
                                </div>
                                {e.remarks && (
                                    <div className="py-4">
                                        <span className="text-xs font-bold">Additional Remarks</span>
                                        <p className="italic text-xs bg-slate-100 p-2 break-words ">{e.remarks}</p>
                                    </div>
                                )}

                                <div className="w-full flex justify-between items-center">
                                    <span className="text-xs text-right">{dayjs(e.created_at).format("DD MMM YYYY, hh:mm:ss a")}</span>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button size={"sm"} variant={"ghost"}>
                                                <Trash2 className="w-4 aspect-square text-red-600" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-md">
                                            <DialogHeader>
                                                <DialogTitle>Are you absolutely sure?</DialogTitle>
                                                <DialogDescription>
                                                    This action cannot be undone. This will permanently delete the record and remove the data from our servers.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <DialogFooter className="sm:justify-start">
                                                <DialogClose asChild>
                                                    <Button type="button" variant="secondary">
                                                        Close
                                                    </Button>
                                                </DialogClose>
                                                <DialogClose asChild>
                                                    <Button className="bg-red-600 hover:bg-red-700" type="button" onClick={() => confirmDelete(e.id)}>
                                                        Confirm
                                                    </Button>
                                                </DialogClose>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default OC;
