import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { WorkType } from "./types";
import { WorkTypeActions } from "./WorkTypeActions";

interface WorkTypesTableProps {
  workTypes: WorkType[];
  onEdit: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}

export const WorkTypesTable = ({ workTypes, onEdit, onDelete }: WorkTypesTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Rate Type</TableHead>
          <TableHead>Created At</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {workTypes?.map((workType) => (
          <TableRow key={workType.id}>
            <TableCell>{workType.name}</TableCell>
            <TableCell className="capitalize">{workType.rate_type}</TableCell>
            <TableCell>{new Date(workType.created_at).toLocaleDateString()}</TableCell>
            <TableCell>
              <WorkTypeActions
                workType={workType}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};