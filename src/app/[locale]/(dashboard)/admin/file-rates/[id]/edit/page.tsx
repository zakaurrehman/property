import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import { getFileRateForEdit } from "@/features/file-rate/server/queries";
import { FileRateForm } from "@/features/file-rate/components/file-rate-form";
import { updateFileRate } from "@/features/file-rate/server/actions";

export const metadata: Metadata = { title: "Edit File Rate" };

export default async function EditFileRatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireAdmin();

  const rate = await getFileRateForEdit(id);
  if (!rate) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-ink-900 text-2xl font-bold">
        Edit — {rate.phase}, {rate.sizeLabel}
      </h1>
      <div className="border-line bg-surface rounded-2xl border p-6 sm:p-8">
        <FileRateForm
          mode="edit"
          defaultValues={{
            locationId: rate.locationId,
            locationLabel: rate.locationLabel,
            plotType: rate.plotType,
            sizeLabel: rate.sizeLabel,
            fileType: rate.fileType as "ALLOCATION",
            demandPkr: rate.demandPkr ?? ("" as unknown as number),
            callForPrice: rate.callForPrice,
            contactName: rate.contactName,
            contactPhone: rate.contactPhone,
            effectiveDate: rate.effectiveDate.toISOString().slice(0, 10),
          }}
          onSubmit={updateFileRate.bind(null, id)}
        />
      </div>
    </div>
  );
}
