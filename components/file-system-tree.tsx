'use client';

import { TreeView, TreeDataItem } from '@/components/tree-view';
import { useFileSystem } from '@/hooks/use-file-system';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { Folder, File, FolderOpen, Loader2 } from 'lucide-react';
import { FileSystemItem } from '@/actions/file-system';
import path from 'path';

interface FileSystemTreeProps {
  basePath?: string;
  onSelect?: (item: FileSystemItem) => void;
  selectedPath?: string;
  placeholder?: string;
  className?: string;
}

export function FileSystemTree({
  basePath = '~',
  onSelect,
  selectedPath,
  placeholder = "Select a folder or file...",
  className
}: FileSystemTreeProps) {
  const { items, error, isLoading, loadFolder } = useFileSystem(basePath);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [loadingFolders, setLoadingFolders] = useState<Set<string>>(new Set());
  const [nestedItems, setNestedItems] = useState<Map<string, FileSystemItem[]>>(new Map());

  // Convert FileSystemItem to TreeDataItem
  const treeData = useMemo(() => {
    const convertToTreeData = (items: FileSystemItem[], parentPath: string = ''): TreeDataItem[] => {
      return items.map(item => {
        // For root items, use the absolute path directly
        // For nested items, use the absolute path from the item
        const fullPath = parentPath ? path.join(parentPath, item.name) : item.path;
        const isExpanded = expandedFolders.has(fullPath);
        const hasNestedData = nestedItems.has(fullPath);
        const isLoading = loadingFolders.has(fullPath);

        return {
          id: fullPath,
          name: item.name,
          icon: item.type === 'folder' ? Folder : File,
          openIcon: item.type === 'folder' ? FolderOpen : File,
          children: item.type === 'folder' && (isExpanded && hasNestedData) ?
            convertToTreeData(nestedItems.get(fullPath) || [], fullPath) :
            (item.type === 'folder' ? [] : undefined),
          onClick: () => onSelect?.(item),
          disabled: isLoading,
          // Add loading indicator for folders
          actions: item.type === 'folder' && isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : undefined,
        };
      });
    };

    return convertToTreeData(items);
  }, [items, expandedFolders, nestedItems, loadingFolders, onSelect]);

  // Handle folder expansion by monitoring the TreeView's expanded state
  const handleSelectChange = useCallback((item: TreeDataItem | undefined) => {
    if (item) {
      // Find the corresponding FileSystemItem
      const findItem = (items: FileSystemItem[], path: string): FileSystemItem | undefined => {
        for (const fsItem of items) {
          if (fsItem.path === path) return fsItem;
          if (fsItem.children) {
            const found = findItem(fsItem.children, path);
            if (found) return found;
          }
        }
        return undefined;
      };

      const fsItem = findItem(items, item.id) ||
        Array.from(nestedItems.values()).flat().find(nestedItem =>
          `${nestedItem.path}` === item.id
        );

      if (fsItem) {
        onSelect?.(fsItem);
      }
    }
  }, [items, nestedItems, onSelect]);

  // Custom expansion handler for folders
  const handleFolderExpand = useCallback(async (folderPath: string) => {
    if (expandedFolders.has(folderPath) || loadingFolders.has(folderPath)) {
      return;
    }

    setLoadingFolders(prev => new Set(prev).add(folderPath));

    try {
      const folderContents = await loadFolder(folderPath);
      setNestedItems(prev => new Map(prev).set(folderPath, folderContents));
      setExpandedFolders(prev => new Set(prev).add(folderPath));
    } catch (error) {
      console.error('Failed to load folder:', error);
    } finally {
      setLoadingFolders(prev => {
        const newSet = new Set(prev);
        newSet.delete(folderPath);
        return newSet;
      });
    }
  }, [loadFolder, expandedFolders, loadingFolders]);

  // Add click handlers to folder items to trigger expansion
  const enhancedTreeData = useMemo(() => {
    const addFolderHandlers = (items: TreeDataItem[]): TreeDataItem[] => {
      return items.map(item => {
        if (item.children && item.children.length === 0) {
          // This is a folder that hasn't been expanded yet
          return {
            ...item,
            onClick: () => {
              handleFolderExpand(item.id);
              // Also call the original onClick if it exists
              if (item.onClick) item.onClick();
            }
          };
        } else if (item.children) {
          // This is a folder that has been expanded, recursively add handlers
          return {
            ...item,
            children: addFolderHandlers(item.children)
          };
        }
        return item;
      });
    };

    return addFolderHandlers(treeData);
  }, [treeData, handleFolderExpand]);

  if (error) {
    return (
      <div className="p-4 text-center text-destructive">
        <p>Error loading file system: {error.message}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
        <p>Loading file system...</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {selectedPath && (
        <div className="p-2 bg-muted rounded-md mb-3">
          <span className="text-sm font-medium">Selected:</span>
          <span className="text-sm text-muted-foreground ml-2">{selectedPath}</span>
        </div>
      )}

      <div className="border rounded-md h-64 overflow-y-auto">
        <TreeView
          data={enhancedTreeData}
          onSelectChange={handleSelectChange}
          initialSelectedItemId={selectedPath}
          expandAll={false}
          onDocumentDrag={undefined}
        />
      </div>
    </div>
  );
}
