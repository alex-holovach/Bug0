"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Tree, Folder, File } from "@/components/magicui/file-tree";
import { listProjectsAction } from "@/actions/projects";
import { useFileSystem } from "@/hooks/use-file-system";
import { getFileContentAction, type FileSystemItem } from "@/actions/file-system";
import { SyntaxHighlighter as PrismSyntaxHighlighter } from "@/containers/preview/file-explorer/syntax-highlighter";

export function Explore({ projectId }: { projectId: number }) {
  const [projectPath, setProjectPath] = useState<string | null>(null);
  const [loadingProject, setLoadingProject] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoadingProject(true);
        const projects = await listProjectsAction();
        const project = projects.find((p: any) => p.id === projectId);
        if (!project) {
          setErrorMessage("Project not found");
          setProjectPath(null);
          return;
        }
        setProjectPath(project.path);
        setErrorMessage(null);
      } catch (err) {
        setErrorMessage("Failed to load project info");
      } finally {
        setLoadingProject(false);
      }
    })();
  }, [projectId]);

  const { items, isLoading, error, loadFolder } = useFileSystem(projectPath ?? "");
  const [childrenByPath, setChildrenByPath] = useState<Record<string, FileSystemItem[]>>({});
  const [loadingPaths, setLoadingPaths] = useState<Set<string>>(new Set());
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [isReadingFile, setIsReadingFile] = useState<boolean>(false);

  const topLevelFiles = useMemo(() => {
    return (items || []).filter((i: FileSystemItem) => i.type === "file");
  }, [items]);

  const topLevelFolders = useMemo(() => {
    return (items || []).filter((i: FileSystemItem) => i.type === "folder");
  }, [items]);

  const handleToggleFolder = useCallback(async (folderPath: string, willExpand: boolean) => {
    if (!willExpand) return;
    if (childrenByPath[folderPath] || loadingPaths.has(folderPath)) return;
    setLoadingPaths((prev) => new Set(prev).add(folderPath));
    try {
      const children = await loadFolder(folderPath);
      setChildrenByPath((prev): Record<string, FileSystemItem[]> => ({
        ...prev,
        [folderPath]: children as FileSystemItem[],
      }));
    } finally {
      setLoadingPaths((prev) => {
        const next = new Set(prev);
        next.delete(folderPath);
        return next;
      });
    }
  }, [childrenByPath, loadingPaths, loadFolder]);

  const renderNode = useCallback((item: FileSystemItem) => {
    if (item.type === "folder") {
      const children = childrenByPath[item.path] || [];
      const isLoadingFolder = loadingPaths.has(item.path);
      return (
        <Folder
          key={item.id}
          value={item.id}
          element={item.name + (isLoadingFolder ? " (loading...)" : "")}
          isSelectable
          onFolderToggle={handleToggleFolder}
        >
          {children.map((child) => renderNode(child))}
        </Folder>
      );
    }
    return (
      <File
        key={item.id}
        value={item.id}
        onClick={async () => {
          setSelectedFilePath(item.path);
          setIsReadingFile(true);
          try {
            const res = await getFileContentAction(item.path);
            setFileContent(res.success ? res.data || "" : `Failed to read file: ${res.error}`);
          } finally {
            setIsReadingFile(false);
          }
        }}
      >
        <span>{item.name}</span>
      </File>
    );
  }, [childrenByPath, handleToggleFolder, loadingPaths]);

  return (
    <ResizablePanelGroup direction="horizontal" className="h-full w-full">
      <ResizablePanel defaultSize={28} minSize={20} maxSize={50} className="h-full">
        <div className="h-full w-full p-2">
          {loadingProject ? (
            <div className="text-sm text-muted-foreground">Loading project...</div>
          ) : errorMessage ? (
            <div className="text-sm text-destructive">{errorMessage}</div>
          ) : error ? (
            <div className="text-sm text-destructive">Failed to read files</div>
          ) : isLoading ? (
            <div className="text-sm text-muted-foreground">Loading files...</div>
          ) : (
            <Tree className="h-full" initialExpandedItems={[]}>
              {topLevelFolders.map(renderNode)}
              {topLevelFiles.map(renderNode)}
            </Tree>
          )}
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={72} className="h-full">
        <div className="h-full w-full overflow-auto p-2">
          {selectedFilePath ? (
            isReadingFile ? (
              <div className="text-sm text-muted-foreground">Loading file...</div>
            ) : (
              <div className="h-full w-full">
                <PrismSyntaxHighlighter path={selectedFilePath} code={fileContent} />
              </div>
            )
          ) : (
            <div className="h-full w-full flex items-center justify-center text-sm text-muted-foreground">
              Select a file to view its contents
            </div>
          )}
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}