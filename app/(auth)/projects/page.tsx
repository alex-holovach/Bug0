import { Button } from "@/components/ui/button";
import { PageHeaderWithTitle } from "@/containers/page-header";
import { ProjectsList } from "@/containers/projects/projects-list";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <>
      <PageHeaderWithTitle title="Projects" >
        <Link href="/projects/new">
          <Button>Add Project</Button>
        </Link>
      </PageHeaderWithTitle>
      <ProjectsList />
    </>
  );
}