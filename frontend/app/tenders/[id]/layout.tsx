import { TenderTabs } from "@/components/layout/TenderTabs";
import { fetchTender } from "@/lib/api";

export default async function TenderLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const tender = await fetchTender(params.id);

  return (
    <div>
      <TenderTabs tenderId={params.id} status={tender.status} />
      {children}
    </div>
  );
}
