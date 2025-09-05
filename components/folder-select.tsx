'use client';
import { FileSystemTree } from '@/components/file-system-tree';
import { useState } from 'react';
import { FileSystemItem } from '@/actions/file-system';

interface FolderSelectProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  basePath?: string;
}

export function FolderSelect({
  value,
  onChange,
  placeholder = "Select a folder...",
  basePath = '~'
}: FolderSelectProps) {
  const [selectedPath, setSelectedPath] = useState<string>(value || '');

  const handleSelect = (item: FileSystemItem) => {
    if (item.type === 'folder') {
      setSelectedPath(item.path);
      onChange?.(item.path);
    }
  };

  return (
    <div className="space-y-3 w-full">
      <FileSystemTree
        basePath={basePath}
        onSelect={handleSelect}
        selectedPath={selectedPath}
        placeholder={placeholder}
      />
    </div>
  );
}