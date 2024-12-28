import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const StaffDashboard = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Staff Dashboard</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Log Hours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="workType">Work Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select work type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="fixed">Fixed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="hours">Hours Worked</Label>
              <Input id="hours" type="number" placeholder="0" />
            </div>
            
            <Button>Log Hours</Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>This Month's Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Total Hours:</span>
              <span className="font-bold">24</span>
            </div>
            <div className="flex justify-between">
              <span>Current Rate:</span>
              <span className="font-bold">$25/hour</span>
            </div>
            <div className="flex justify-between">
              <span>Expected Salary:</span>
              <span className="font-bold">$600</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};