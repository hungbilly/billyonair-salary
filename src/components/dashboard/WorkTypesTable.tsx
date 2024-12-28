import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { WorkTypeActions } from "./WorkTypeActions";
import { AssignWorkTypeDialog } from "./AssignWorkTypeDialog";
import { WorkType } from "./types";

interface WorkTypesTableProps {
  workTypes: WorkType[];
  onEdit: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onWorkTypeUpdated?: () => void;
}

export const WorkTypesTable = ({ workTypes, onEdit, onDelete, onWorkTypeUpdated }: WorkTypesTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Rate Type</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {workTypes.map((workType) => (
          <TableRow key={workType.id}>
            <TableCell>{workType.name}</TableCell>
            <TableCell className="capitalize">{workType.rate_type}</TableCell>
            <TableCell>
              <div className="flex gap-2">
                <AssignWorkTypeDialog workType={workType} onAssigned={onWorkTypeUpdated} />
                <WorkTypeActions 
                  workType={workType} 
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};