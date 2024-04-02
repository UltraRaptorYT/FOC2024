import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@radix-ui/react-label";
import { User } from "@/hooks/AuthContext";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/utils/supabase";

function ApocalypseQuestion({
  groups,
  auth,
  activity_id,
  min = 0,
  max = Infinity,
}: {
  groups: any[];
  auth: User | null;
  activity_id: number;
  min?: number;
  max?: number;
}) {
  const [firstGroup, setFirstGroup] = useState<string>();
  const [secondGroup, setSecondGroup] = useState<string>();
  const [thirdGroup, setThirdGroup] = useState<string>();
  const [fourthGroup, setFourthGroup] = useState<string>();

  const [firstValue, setFirstValue] = useState<number | "">("");
  const [secondValue, setSecondValue] = useState<number | "">("");
  const [thirdValue, setThirdValue] = useState<number | "">("");
  const [fourthValue, setFourthValue] = useState<number | "">("");

  function checkValue(value: number | ""): boolean {
    if (String(value).trim().length == 0) {
      toast.warning(`Input value is invalid`);
      return false;
    }
    const intValue = Number(value);
    if (!Number.isInteger(intValue)) {
      toast.warning(`Input value is not an integer`);
      return false;
    }
    if (intValue < min) {
      toast.warning(`Input value is lower than ${min}`);
      return false;
    }
    if (intValue > max) {
      toast.warning(`Input value is higher than ${max}`);
      return false;
    }
    return true;
  }

  function checkGroup(
    group: string | undefined,
    place: "1st" | "2nd" | "3rd" | "4th"
  ): boolean {
    if (!group) {
      toast.warning(`No ${place} Group selected`);
      return false;
    }
    return true;
  }

  async function submitForm() {
    let firstGroupValidation = checkGroup(firstGroup, "1st");
    let secondGroupValidation = checkGroup(secondGroup, "2nd");
    let thirdGroupValidation = checkGroup(thirdGroup, "3rd");
    let fourthGroupValidation = checkGroup(fourthGroup, "4th");

    let firstValueValidation = checkValue(firstValue);
    let secondValueValidation = checkValue(secondValue);
    let thirdValueValidation = checkValue(thirdValue);
    let fourthValueValidation = checkValue(fourthValue);

    if (
      !(
        firstGroupValidation &&
        secondGroupValidation &&
        thirdGroupValidation &&
        fourthGroupValidation &&
        firstValueValidation &&
        secondValueValidation &&
        thirdValueValidation &&
        fourthValueValidation &&
        auth
      )
    ) {
      return;
    }

    // Ensure Groups are not the same
    const groupArr = [firstGroup, secondGroup, thirdGroup, fourthGroup];
    if (new Set(groupArr).size != groupArr.length) {
      toast.error("No duplicated groups for game");
      return;
    }

    function isSorted(arr: (number | "")[]): boolean {
      for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i] > arr[i + 1]) {
          return false;
        }
      }
      return true;
    }

    const pointsArr = [fourthValue, thirdValue, secondValue, firstValue];

    if (!isSorted(pointsArr)) {
      toast.error("Wrong ranking of teams");
      return;
    }

    let success: boolean[] = [];

    async function addSupabase(
      group: string | undefined,
      value: number | "",
      add: number
    ) {
      if (!(auth && group)) {
        return;
      }
      const { data, error } = await supabase
        .from("foc_points")
        .insert([
          {
            user: auth.admin,
            group: group,
            game: activity_id,
            point: Number(value) + add,
          },
        ])
        .select();
      if (error || !data) {
        console.log(error);
        success.push(false);
        toast.error("Internal Server Error");
        return;
      }
      if (data.length) {
        success.push(true);
        return;
      }
    }

    addSupabase(firstGroup, firstValue, 20);
    addSupabase(secondGroup, secondValue, 10);
    addSupabase(thirdGroup, thirdValue, 5);
    addSupabase(fourthGroup, fourthValue, 3);

    if (success.filter((e) => e)) {
      toast.success("Points Added");
      return;
    }
    return;
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid w-full max-w-sm items-center gap-2">
          <Label htmlFor="winner" className="text-lg font-bold">
            1st
          </Label>
          <Select
            onValueChange={(value) => {
              if (value) {
                setFirstGroup(value);
              }
            }}
            value={firstGroup}
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
                setFirstValue("");
              }
              let value = Number(valueString);
              let valueValidation = checkValue(value);
              if (valueValidation) {
                setFirstValue(value);
              }
            }}
            value={String(firstValue).trim().length == 0 ? "" : firstValue}
            type="number"
            id="number"
            placeholder="Players left"
            min={min}
            max={max}
          />
        </div>
        <div className="grid w-full max-w-sm items-center gap-2">
          <Label htmlFor="winner" className="text-lg font-bold">
            2nd
          </Label>
          <Select
            onValueChange={(value) => {
              if (value) {
                setSecondGroup(value);
              }
            }}
            value={secondGroup}
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
                setSecondValue("");
              }
              let value = Number(valueString);
              let valueValidation = checkValue(value);
              if (valueValidation) {
                setSecondValue(value);
              }
            }}
            value={String(secondValue).trim().length == 0 ? "" : secondValue}
            type="number"
            id="number"
            placeholder="Players left"
            min={min}
            max={max}
          />
        </div>
        <div className="grid w-full max-w-sm items-center gap-2">
          <Label htmlFor="winner" className="text-lg font-bold">
            3rd
          </Label>
          <Select
            onValueChange={(value) => {
              if (value) {
                setThirdGroup(value);
              }
            }}
            value={thirdGroup}
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
                setThirdValue("");
              }
              let value = Number(valueString);
              let valueValidation = checkValue(value);
              if (valueValidation) {
                setThirdValue(value);
              }
            }}
            value={String(thirdValue).trim().length == 0 ? "" : thirdValue}
            type="number"
            id="number"
            placeholder="Players left"
            min={min}
            max={max}
          />
        </div>
        <div className="grid w-full max-w-sm items-center gap-2">
          <Label htmlFor="winner" className="text-lg font-bold">
            4th
          </Label>
          <Select
            onValueChange={(value) => {
              if (value) {
                setFourthGroup(value);
              }
            }}
            value={fourthGroup}
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
                setFourthValue("");
              }
              let value = Number(valueString);
              let valueValidation = checkValue(value);
              if (valueValidation) {
                setFourthValue(value);
              }
            }}
            value={String(fourthValue).trim().length == 0 ? "" : fourthValue}
            type="number"
            id="number"
            placeholder="Players left"
            min={min}
            max={max}
          />
        </div>
      </div>
      <Button className="mx-auto px-6" onClick={() => submitForm()}>
        Submit
      </Button>
    </>
  );
}

export default ApocalypseQuestion;
