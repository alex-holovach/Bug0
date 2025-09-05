import { getProjectLogsAction } from "@/actions/project-processes";
import { LogRecord } from "@/types/logs";
import useSWR from "swr";

export const useProjectLogs = (projectId: number) => {
  const { data, error, isLoading } = useSWR<LogRecord[]>(`logs-${projectId}`, async () => {
    const logs = await getProjectLogsAction(projectId);
    if (logs.success) {
      return logs.stdout?.split('\n').map(line => ({
        body: line,
        attributes: {}
      }));
    }
    return [];
  }, {
    refreshInterval: 1000,
    revalidateOnFocus: false
  });

  return { data, error, isLoading };
};