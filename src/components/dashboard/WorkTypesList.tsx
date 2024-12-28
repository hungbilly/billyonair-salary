import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase } from "lucide-react";
import { WorkTypesTable } from "./WorkTypesTable";
import { useWorkTypes } from "@/hooks/useWorkTypes";

export const WorkTypesList = () => {
  const { workTypes, isLoading, error, updateWorkType, deleteWorkType } = useWorkTypes();

  if (isLoading) {
    return <div>Loading work types...</div>;
  }

  if (error) {
    console.error("Error loading work types:", error);
    return <div>Error loading work types</div>;
  }

  const handleUpdateWorkType = (id: string, name: string) => {
    console.log("Handling update work type:", { id, name });
    updateWorkType({ id, name });
  };

  const handleDeleteWorkType = (id: string) => {
    console.log("Handling delete work type:", id);
    if (confirm("Are you sure you want to delete this work type?")) {
      deleteWorkType(id);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-xl font-bold">
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Work Types
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <WorkTypesTable
          workTypes={workTypes}
          onEdit={handleUpdateWorkType}
          onDelete={handleDeleteWorkType}
        />
      </CardContent>
    </Card>
  );
};