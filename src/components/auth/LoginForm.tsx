import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const LoginForm = () => {
  const [userType, setUserType] = useState<"employer" | "staff">("staff");

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          TimeSheet Login
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="m@example.com" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" />
          </div>
          <div className="flex gap-2">
            <Button
              variant={userType === "staff" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setUserType("staff")}
            >
              Staff
            </Button>
            <Button
              variant={userType === "employer" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setUserType("employer")}
            >
              Employer
            </Button>
          </div>
          <Button className="w-full">Login</Button>
        </div>
      </CardContent>
    </Card>
  );
};