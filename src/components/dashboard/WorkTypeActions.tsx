import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { WorkType } from "./types";

interface WorkTypeActionsProps {
  workType: WorkType;
  onEdit: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}

export const WorkTypeActions = ({ workType, onEdit, onDelete }: WorkTypeActionsProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(workType.name);

  const handleUpdateWorkType = () => {
    onEdit(workType.id, editedName);
    setIsEditing(false);
  };

  return (
    <div className="flex gap-2">
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditedName(workType.name);
              setIsEditing(true);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Work Type</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Work Type Name"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
            />
            <Button onClick={handleUpdateWorkType} disabled={!editedName || editedName === workType.name}>
              Update Work Type
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onDelete(workType.id)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};