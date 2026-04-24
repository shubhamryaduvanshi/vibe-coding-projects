import { useQuery } from "@tanstack/react-query";
import { Card } from "@neo/ui";
import { getTimeReport } from "../api/reports";

export const ReportsPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["time-report"],
    queryFn: getTimeReport
  });

  if (isLoading || !data) {
    return <div>Loading report...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs uppercase tracking-[0.35em] text-red-500">Reporting</div>
        <h2 className="text-3xl font-semibold">Time Report</h2>
        <p className="text-sm text-zinc-400">
          Project-wide hours aggregated from immutable task worklogs.
        </p>
      </div>

      <Card className="overflow-hidden">
        <table className="min-w-full divide-y divide-zinc-800 text-left text-sm">
          <thead className="bg-zinc-950">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Assignee</th>
              <th className="px-4 py-3">Total Hours</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900">
            {data.rows.map((row) => (
              <tr key={`${row.title}-${row.status}`}>
                <td className="px-4 py-3 text-white">{row.title}</td>
                <td className="px-4 py-3 text-zinc-300">{row.status}</td>
                <td className="px-4 py-3 text-zinc-300">{row.assignee ?? "Unassigned"}</td>
                <td className="px-4 py-3 text-zinc-100">{row.totalHours.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-zinc-950">
            <tr>
              <td className="px-4 py-3 font-semibold text-white" colSpan={3}>
                Grand Total
              </td>
              <td className="px-4 py-3 font-semibold text-red-400">
                {data.grandTotalHours.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </Card>
    </div>
  );
};
