import useSWR, { mutate } from 'swr';
import { createProjectAction, listProjectsAction } from '@/actions/projects';
import { Project } from '@/db/schema';
import { GitInfo, getGitInfoAction } from '@/actions/git';

type ProjectDetails = {
  data: Project
  gitInfo: GitInfo
}

export function useProjects() {
  const { data: result, error, isLoading } = useSWR(
    'projects',
    async () => {
      const projects = await listProjectsAction();

      // Fetch details for each project concurrently
      const projectDetailsPromises = projects.map(async (project) => {
        const gitInfo = await getGitInfoAction(project.path);

        return {
          data: project,
          gitInfo,
        } as ProjectDetails;

      });

      const projectDetails = await Promise.all(projectDetailsPromises);
      return projectDetails;
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  const createProject = async (
    projectPath: string,
    projectName: string,
    runCommand: string,
  ) => {
    const response = await createProjectAction(projectPath, projectName, runCommand);
    mutate('projects');
  };

  return { projects: result || [], error, isLoading, createProject };
}


