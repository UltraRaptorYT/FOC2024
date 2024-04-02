import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useRef } from "react";
import { supabase } from "@/utils/supabase";
import { toast } from "sonner";
import useAuth from "@/hooks/useAuth";
import { User } from "@/hooks/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { auth, login } = useAuth();
  const navigate = useNavigate();
  const adminRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (auth) {
      navigate("/");
    }
  }, []);

  async function checkCredentials() {
    if (!(adminRef.current && passwordRef.current)) {
      return toast.error("Input Ref Failed");
    }
    if (!(adminRef.current.value.trim() && passwordRef.current.value.trim())) {
      return toast.warning("Admin No and Password cannot be empty");
    }

    const adminNo = adminRef.current.value.trim();
    const password = passwordRef.current.value.trim();

    const { data, error } = await supabase
      .from("foc_user")
      .select()
      .eq("admin", adminNo)
      .eq("phone", password);
    if (error) {
      console.log(error);
      return toast.error(JSON.stringify(error));
    }
    
    if (data.length == 0) {
      return toast.error("Admin No and Password not found");
    } else {
      const user: User = data[0];
      login(user);
      navigate("/");

      return toast.success("Login successful");
    }
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-center">SOC FOC 24'</CardTitle>
          <CardTitle className="text-3xl text-center">BLINK IN TIME</CardTitle>
          {/* <CardDescription>
            Enter your  below to login to your account.
          </CardDescription> */}
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="admin">Admin No.</Label>
            <Input
              id="admin"
              type="text"
              placeholder="2100775"
              required
              ref={adminRef}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required ref={passwordRef} />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={() => checkCredentials()}>
            Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
