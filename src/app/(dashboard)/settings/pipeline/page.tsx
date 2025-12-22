import { requireAdmin } from "@/lib/db/tenant-context";
import { prisma } from "@/lib/prisma";
import { StageList } from "./stage-list";

async function getPipeline(tenantId: string) {
  const pipeline = await prisma.pipeline.findFirst({
    where: { tenantId },
    include: {
      stages: {
        orderBy: { position: "asc" },
      },
    },
  });
  return pipeline;
}

export default async function PipelineSettingsPage() {
  const { tenantId } = await requireAdmin();
  const pipeline = await getPipeline(tenantId);

  if (!pipeline) {
    return <div>No pipeline found</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold">Pipeline Settings</h1>
        <p className="text-slate-600">Manage your sales pipeline stages</p>
      </div>
      <StageList pipelineId={pipeline.id} stages={pipeline.stages} />
    </div>
  );
}
