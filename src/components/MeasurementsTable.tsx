import { useState } from "react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Measurement } from "@/types";

interface MeasurementsTableProps {
  data: Measurement[];
}

const DEFAULT_VISIBLE = 30;

export function MeasurementsTable({ data }: MeasurementsTableProps) {
  const [showAll, setShowAll] = useState(false);
  const reversed = [...data].reverse();
  const visible = showAll ? reversed : reversed.slice(0, DEFAULT_VISIBLE);

  return (
    <Card className="bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Measurements</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Weight</TableHead>
                <TableHead className="text-right">Fat-Free</TableHead>
                <TableHead className="text-right">Body Fat %</TableHead>
                <TableHead className="text-right">BMI</TableHead>
                <TableHead className="text-right">BMR</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((m) => (
                <TableRow key={m.measured_at}>
                  <TableCell className="whitespace-nowrap">
                    {format(new Date(m.measured_at), "MMM d, yyyy h:mm a")}
                  </TableCell>
                  <TableCell className="text-right">
                    {m.weight.toFixed(1)}
                  </TableCell>
                  <TableCell className="text-right">
                    {m.fat_free_weight.toFixed(1)}
                  </TableCell>
                  <TableCell className="text-right">
                    {m.body_fat.toFixed(1)}%
                  </TableCell>
                  <TableCell className="text-right">
                    {m.bmi.toFixed(1)}
                  </TableCell>
                  <TableCell className="text-right">{m.bmr}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {data.length > DEFAULT_VISIBLE && (
          <div className="mt-3 text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll
                ? "Show less"
                : `Show all ${data.length} measurements`}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
