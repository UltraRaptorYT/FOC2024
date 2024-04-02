import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User } from "@/hooks/AuthContext";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/utils/supabase";

function ItemQuestion({
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
  const [group, setGroup] = useState<string>();
  const [value, setValue] = useState<number | "">("");

  function checkValue(value: number | ""): boolean {
    if (!value) {
      toast.warning(`Input value is invalid`);
      return false;
    }
    if (value < min) {
      toast.warning(`Input value is lower than ${min}`);
      return false;
    }
    if (value > max) {
      toast.warning(`Input value is higher than ${max}`);
      return false;
    }
    if (!Number.isInteger(value)) {
      toast.warning(`Input value is not an integer`);
      return false;
    }
    return true;
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
          game: activity_id,
          point: value,
        },
      ])
      .select();
    if (error || !data) {
      console.log(error);
      toast.error("Internal Server Error");
      return;
    }
    if (data.length) {
      setValue("");
      return toast.success("Items Added");
    }
  }

  return (
    <>
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
        placeholder="Number of items"
        min={min}
        max={max}
      />
      <Button className="mx-auto px-6" onClick={() => submitForm()}>
        Submit
      </Button>
    </>
  );
}

export default ItemQuestion;
