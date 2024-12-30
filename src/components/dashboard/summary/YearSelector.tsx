import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface YearSelectorProps {
  years: number[];
  selectedYear: number;
  onYearChange: (year: number) => void;
}

export const YearSelector = ({ years, selectedYear, onYearChange }: YearSelectorProps) => {
  return (
    <Tabs value={selectedYear.toString()} onValueChange={(value) => onYearChange(Number(value))}>
      <TabsList>
        {years.map((year) => (
          <TabsTrigger key={year} value={year.toString()}>
            {year}
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value={selectedYear.toString()} />
    </Tabs>
  );
};