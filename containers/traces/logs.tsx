import { AnimatedSpan, Terminal, TypingAnimation } from "@/components/magicui/terminal";
import { useProjectLogs } from "@/hooks/use-project-logs";

export function Logs({ projectId }: { projectId: number }) {
  const { data, error, isLoading } = useProjectLogs(projectId);

  return <Terminal className="h-full w-full">
    {data?.map((log, idx) => (
      <span key={idx}>{log.body}</span>
    ))}
  </Terminal>
}