"use client";

import { motion } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, Circle, GitBranch, GitCommit, MessageSquare } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FolderSelect } from "@/components/folder-select";
import { useGitInfo } from "@/hooks/use-git-info";
import { useNextjsProjectInfo } from "@/hooks/use-nextjs-project-info";
import { useProjects } from "@/hooks/use-projects";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DotPattern } from "@/components/magicui/dot-pattern";
import { cn } from "@/lib/utils";

type Step = 'path' | 'details';

export const NewProjectStepper: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>('path');
  const [selectedFolder, setSelectedFolder] = useState<string | undefined>(undefined);
  const [projectName, setProjectName] = useState<string>('');
  const [runCommand, setRunCommand] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);
  const { gitInfo, isLoading: gitLoading, error: gitError } = useGitInfo(selectedFolder);
  const { projectInfo, isLoading: projectInfoLoading } = useNextjsProjectInfo(selectedFolder);
  const { createProject } = useProjects();
  const router = useRouter();

  // Pre-fill inputs when project info is loaded
  useEffect(() => {
    if (projectInfo) {
      setProjectName(projectInfo.projectName);
      setRunCommand(projectInfo.runCommand);
    }
  }, [projectInfo]);

  const handleNextStep = () => {
    if (!selectedFolder) {
      toast.error('Please select a project folder first');
      return;
    }
    setCurrentStep('details');
  };

  const handleCreateProject = async () => {
    if (!selectedFolder || !projectName || !runCommand) {
      return;
    }

    setIsCreating(true);
    try {
      await createProject(selectedFolder, projectName, runCommand);
      toast.success('Project created successfully!');
      router.push('/projects');
    } catch (error) {
      console.error('Failed to create project:', error);
      toast.error('Failed to create project. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-background">
      {/* Fallback CSS dot pattern */}
      <div
        className="absolute inset-0 opacity-20 w-full h-full"
        style={{
          backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 10px 10px'
        }}
      />
      <DotPattern
        className="opacity-50 absolute inset-0 w-full h-full"
        width={20}
        height={20}
        cr={1}
      />
      <section className="relative overflow-hidden min-h-screen flex items-center justify-center">
        <div className="container relative flex max-w-2xl flex-col items-start gap-10 md:gap-0 z-10">
          <div className="space-y-4 w-full">
            <h1 className="text-4xl font-bold text-foreground">
              Import your existing Next.js project
            </h1>
          </div>

          {currentStep === 'path' && (
            <div className="w-[600px] max-w-2xl">
              <Card className="my-4 min-h-[400px]">
                <CardContent>
                  <p className="text-sm font-medium text-foreground mb-2">
                    Project location
                  </p>
                  <FolderSelect
                    value={selectedFolder}
                    onChange={(folderPath) => {
                      setSelectedFolder(folderPath);
                    }}
                  />
                </CardContent>
              </Card>
              <div className="flex justify-end mt-4">
                <Button
                  onClick={handleNextStep}
                  className="flex gap-2 transition-all ease-in-out hover:gap-4"
                  variant="default"
                >
                  Next
                  <ChevronRight size={20} />
                </Button>
              </div>
            </div>
          )}

          {currentStep === 'details' && (
            <Card className="my-4 min-h-[400px] w-[600px] max-w-2xl">
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <p className="text-sm font-medium text-foreground">Selected Folder</p>
                  <p className="text-sm text-muted-foreground font-mono bg-muted px-3 py-2 rounded-md">
                    {selectedFolder}
                  </p>
                </div>

                <Separator />

                <div className="space-y-3">
                  <p className="text-sm font-medium text-foreground">Git Information</p>
                  {gitLoading ? (
                    <div className="text-sm text-muted-foreground">Loading git information...</div>
                  ) : gitError ? (
                    <div className="text-sm text-destructive">Error loading git information</div>
                  ) : gitInfo?.isGitRepo ? (
                    <div className="space-y-3">
                      {gitInfo.branch && (
                        <div className="flex items-center gap-2">
                          <GitBranch className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Branch:</span>
                          <Badge variant="secondary">{gitInfo.branch}</Badge>
                        </div>
                      )}
                      {gitInfo.commitSha && (
                        <div className="flex items-center gap-2">
                          <GitCommit className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Commit:</span>
                          <Badge variant="outline" className="font-mono text-xs">
                            {gitInfo.commitSha.substring(0, 8)}
                          </Badge>
                        </div>
                      )}
                      {gitInfo.commitMessage && (
                        <div className="flex items-start gap-2">
                          <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <span className="text-sm text-muted-foreground">Message:</span>
                          <p className="text-sm text-foreground flex-1">{gitInfo.commitMessage}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-sm text-destructive font-medium">⚠️ No git repository found</div>
                      <div className="text-sm text-muted-foreground">
                        The selected folder should be a Next.js repository with git initialized.
                        Please select a folder that contains a valid Next.js project with git history.
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="project-name">Project Name</Label>
                    {projectInfoLoading ? (
                      <div className="text-sm text-muted-foreground">Loading project info...</div>
                    ) : (
                      <Input
                        id="project-name"
                        placeholder="Enter project name"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="run-command">Run Command</Label>
                    {projectInfoLoading ? (
                      <div className="text-sm text-muted-foreground">Loading project info...</div>
                    ) : (
                      <Input
                        id="run-command"
                        placeholder="e.g., npm run dev"
                        value={runCommand}
                        onChange={(e) => setRunCommand(e.target.value)}
                      />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex w-full justify-center gap-3 tracking-tight">
            {currentStep === 'details' && (
              <Button
                onClick={() => setCurrentStep('path')}
                variant="outline"
                className="flex gap-2 transition-all ease-in-out hover:gap-4"
              >
                <ChevronLeft size={20} />
                Back
              </Button>
            )}
            <div className="flex gap-3 ml-auto">
              {currentStep === 'details' && (
                <Button
                  onClick={handleCreateProject}
                  className="flex gap-2 transition-all ease-in-out hover:gap-4"
                  variant="default"
                  disabled={isCreating || !selectedFolder || !projectName || !runCommand || !gitInfo?.isGitRepo}
                >
                  {isCreating ? 'Creating...' : 'Create Project'}
                  <Check size={20} />
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

