import { Users } from "lucide-react";
import { CardHeader, CardTitle } from "@/components/ui/card";

export const StaffListHeader = () => {
  return (
    <CardHeader className="flex flex-row items-center justify-between space-y-0">
      <CardTitle className="text-xl font-bold">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Staff List
        </div>
      </CardTitle>
    </CardHeader>
  );
};