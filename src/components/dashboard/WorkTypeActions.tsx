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
  const [editingWorkType, setEditingWorkType] = useState<{ id: string; name: string } | null>(null);

  const handleUpdateWorkType = () => {
    if (!editingWorkType) return;
    onEdit(editingWorkType.id, editingWorkType.name);
    setEditingWorkType(null);
  };

  return (
    <div className="flex gap-2">
      <Dialog 
        open={editingWorkType?.id === workType.id} 
        onOpenChange={(open) => !open && setEditingWorkType(null)}
      >
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditingWorkType({ id: workType.id, name: workType.name })}
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
              value={editingWorkType?.name || ""}
              onChange={(e) => setEditingWorkType(prev => prev ? { ...prev, name: e.target.value } : null)}
            />
            <Button onClick={handleUpdateWorkType} disabled={!editingWorkType?.name}>
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