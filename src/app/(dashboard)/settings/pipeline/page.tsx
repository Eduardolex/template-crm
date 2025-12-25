import { requireAdmin } from "@/lib/db/tenant-context";
import { prisma } from "@/lib/prisma";
import { StageList } from "./stage-list";

export default async function PipelineSettingsPage() {
  const { tenantId } = await requireAdmin();

  // Fetch pipeline with stage automations and automation templates in parallel
  const [pipeline, automationTemplates] = await Promise.all([
    prisma.pipeline.findFirst({
      where: { tenantId },
      include: {
        stages: {
          include: {
            automations: {
              include: {
                automationTemplate: true,
              },
              orderBy: { position: 'asc' },
            },
          },
          orderBy: { position: "asc" },
        },
      },
    }),
    prisma.automationTemplate.findMany({
      where: { tenantId },
      select: { id: true, name: true, enabled: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  if (!pipeline) {
    return <div>No pipeline found</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold">Pipeline Settings</h1>
        <p className="text-slate-600">Manage your sales pipeline stages</p>
      </div>
      <StageList
        pipelineId={pipeline.id}
        stages={pipeline.stages}
        automationTemplates={automationTemplates}
      />
    </div>
  );
}
