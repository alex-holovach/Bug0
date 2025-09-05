import useSWR, { mutate } from 'swr';
import {
  startProjectAction,
  stopProjectAction,
  getAllProjectsStatusAction,
  cleanupDeadProcessesAction,
  getProjectLogsAction
} from '@/actions/project-processes';

export function useProjectProcesses() {
  const { data: processStatuses, error, isLoading } = useSWR(
    'project-processes',
    getAllProjectsStatusAction,
    {
      refreshInterval: 5000, // Refresh every 5 seconds
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  const startProject = async (projectId: number) => {
    try {
      const result = await startProjectAction(projectId);
      if (result.success) {
        // Revalidate the process statuses
        mutate('project-processes');
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to start project'
      };
    }
  };

  const stopProject = async (projectId: number) => {
    try {
      const result = await stopProjectAction(projectId);
      if (result.success) {
        // Revalidate the process statuses
        mutate('project-processes');
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to stop project'
      };
    }
  };

  const cleanupProcesses = async () => {
    try {
      await cleanupDeadProcessesAction();
      mutate('project-processes');
    } catch (error) {
      console.error('Failed to cleanup processes:', error);
    }
  };

  const getProjectLogs = async (projectId: number) => {
    try {
      return await getProjectLogsAction(projectId);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get project logs'
      };
    }
  };

  const getProjectStatus = (projectId: number) => {
    if (!processStatuses) return 'stopped';
    return processStatuses[projectId]?.status || 'stopped';
  };

  const getProjectProcessId = (projectId: number) => {
    if (!processStatuses) return null;
    return processStatuses[projectId]?.processId || null;
  };

  const getProjectStartedAt = (projectId: number) => {
    if (!processStatuses) return null;
    return processStatuses[projectId]?.startedAt || null;
  };

  return {
    processStatuses,
    error,
    isLoading,
    startProject,
    stopProject,
    cleanupProcesses,
    getProjectLogs,
    getProjectStatus,
    getProjectProcessId,
    getProjectStartedAt,
  };
}
