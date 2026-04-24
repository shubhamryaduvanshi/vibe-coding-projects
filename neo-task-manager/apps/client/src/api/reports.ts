import type { TimeReportResponse } from "@neo/types";
import { http } from "../lib/http";

export const getTimeReport = async () =>
  (await http.get<TimeReportResponse>("/reports/time")).data;

