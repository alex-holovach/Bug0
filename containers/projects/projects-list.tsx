"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Square, RotateCcw, FileText } from "lucide-react";
import { useProjects } from "@/hooks/use-projects";
import { useProjectProcesses } from "@/hooks/use-project-processes";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getProjectServerProcessAction } from "@/actions/project-processes";
import { setProjectCookiesAction } from "@/actions/projects";

export function ProjectsList() {
  const { projects, isLoading, error } = useProjects();
  const router = useRouter();
  const {
    startProject,
    stopProject,
    getProjectStatus,
    getProjectProcessId,
    getProjectStartedAt,
    cleanupProcesses,
    isLoading: processesLoading
  } = useProjectProcesses();

  // Clean up dead processes on mount
  React.useEffect(() => {
    cleanupProcesses();
  }, [cleanupProcesses]);

  const handleCardClick = async (projectId: number) => {
    try {
      // Get project server info to find the running port
      const serverInfo = await getProjectServerProcessAction(projectId);

      // If project is running and has ports, set both cookies
      if (serverInfo.success && serverInfo.ports.length > 0) {
        const firstPort = serverInfo.ports.find((port: any) => port.state === 'LISTEN');
        if (firstPort) {
          const projectUrl = `http://localhost:${firstPort.port}`;
          await setProjectCookiesAction(projectUrl, projectId);
        }
      } else {
        // Even if no ports are running, set the project ID cookie
        await setProjectCookiesAction('', projectId);
      }
    } catch (error) {
      console.warn('Failed to set project cookies:', error);
    }

    // Navigate to project page
    router.push(`/projects/${projectId}`);
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  if (isLoading) {
    return <div className="pt-16 w-full flex justify-center items-center">Loading projects…</div>;
  }

  if (error) {
    return <div className="pt-16 w-full flex justify-center items-center">Failed to load projects</div>;
  }

  if (!projects?.length) {
    return <div className="pt-16 w-full flex justify-center items-center">No projects yet</div>;
  }

  return (
    <div className="pt-16 w-full flex justify-center items-center">
      <div className="flex flex-col gap-4 max-w-4xl w-full">
        {projects.map((project) => {
          const shortSha = project.gitInfo.commitSha ? String(project.gitInfo.commitSha).slice(0, 7) : "—";
          const currentStatus = getProjectStatus(project.data.id);
          const statusColor = currentStatus === 'running' ? 'bg-emerald-500' : currentStatus === 'stopped' ? 'bg-red-500' : 'bg-zinc-400';
          const processId = getProjectProcessId(project.data.id);
          const startedAt = getProjectStartedAt(project.data.id);

          const handleStartProject = async () => {
            const result = await startProject(project.data.id);
            if (result.success) {
              toast.success(`Started ${project.data.name}`);
            } else {
              toast.error(`Failed to start ${project.data.name}: ${result.error}`);
            }
          };

          const handleStopProject = async () => {
            const result = await stopProject(project.data.id);
            if (result.success) {
              toast.success(`Stopped ${project.data.name}`);
            } else {
              toast.error(`Failed to stop ${project.data.name}: ${result.error}`);
            }
          };

          return (
            <Card
              key={project.data.id}
              className="py-2 cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => handleCardClick(project.data.id)}
            >
              <CardHeader className="pb-2 pt-2 px-4">
                {/* Project Info Section */}
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-sm">{project.data.name}</CardTitle>
                    <CardDescription className="text-xs">{project.data.path}</CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-xs">
                      <span className={`inline-block h-2 w-2 rounded-full ${statusColor}`} />
                      <span className="font-medium text-foreground/90">{currentStatus}</span>
                      {processId && (
                        <span className="text-muted-foreground">(PID: {processId})</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {currentStatus === 'running' ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={(e) => {
                            handleButtonClick(e);
                            handleStopProject();
                          }}
                          disabled={processesLoading}
                          title="Stop project"
                        >
                          <Square className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50"
                          onClick={(e) => {
                            handleButtonClick(e);
                            handleStartProject();
                          }}
                          disabled={processesLoading}
                          title="Start project"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Separator */}
                <div className="border-t border-border my-2" />

                {/* Git Info Section */}
                <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="text-foreground/60">{shortSha}</span>
                    {project.gitInfo.commitMessage && (
                      <span className="truncate max-w-[40ch] text-foreground/90">
                        {project.gitInfo.commitMessage}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    {startedAt && currentStatus === 'running' && (
                      <div className="flex items-center gap-1">
                        <span className="text-foreground/60">started</span>
                        <span className="font-medium text-foreground/90">
                          {new Date(startedAt).toLocaleTimeString()}
                        </span>
                      </div>
                    )}
                    {project.gitInfo.branch && (
                      <div className="flex items-center gap-1">
                        <span className="text-foreground/60">branch</span>
                        <span className="font-medium text-foreground/90">{project.gitInfo.branch}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
