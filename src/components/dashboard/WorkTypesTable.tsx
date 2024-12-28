import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { WorkTypeActions } from "./WorkTypeActions";
import { AssignWorkTypeDialog } from "./AssignWorkTypeDialog";

interface WorkTypesTableProps {
  workTypes: any[];
  onWorkTypeUpdated?: () => void;
}

export const WorkTypesTable = ({ workTypes, onWorkTypeUpdated }: WorkTypesTableProps) => {
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
                <WorkTypeActions workType={workType} onWorkTypeUpdated={onWorkTypeUpdated} />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};