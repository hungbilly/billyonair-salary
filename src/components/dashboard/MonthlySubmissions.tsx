import { format } from "date-fns";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface MonthlySubmissionsProps {
  timesheets: any[];
}

export const MonthlySubmissions = ({ timesheets }: MonthlySubmissionsProps) => {
  // Group timesheets by month
  const monthlyTimesheets = timesheets.reduce((acc: Record<string, any[]>, timesheet) => {
    const monthKey = format(new Date(timesheet.work_date), "MMMM yyyy");
    if (!acc[monthKey]) {
      acc[monthKey] = [];
    }
    acc[monthKey].push(timesheet);
    return acc;
  }, {});

  return (
    <Accordion type="single" collapsible className="w-full">
      {Object.entries(monthlyTimesheets).map(([month, sheets]) => (
        <AccordionItem value={month} key={month}>
          <AccordionTrigger className="text-lg font-semibold">
            {month}
          </AccordionTrigger>
          <AccordionContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Work Type</TableHead>
                  <TableHead className="text-right">Hours/Jobs</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sheets.map((sheet) => (
                  <TableRow key={sheet.id}>
                    <TableCell>{format(new Date(sheet.work_date), "MMM d, yyyy")}</TableCell>
                    <TableCell>{sheet.work_types.name}</TableCell>
                    <TableCell className="text-right">
                      {sheet.hours} {sheet.work_types.rate_type === 'fixed' ? 'job(s)' : 'hour(s)'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};