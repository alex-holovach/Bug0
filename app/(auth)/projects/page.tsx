import { listProjectsAction } from "@/actions/projects";
import { Button } from "@/components/ui/button";
import { PageHeaderWithTitle } from "@/containers/page-header";
import { ProjectsList } from "@/containers/projects/projects-list";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const projects = await listProjectsAction();
  if (projects.length === 0) {
    redirect("/projects/new");
  }

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