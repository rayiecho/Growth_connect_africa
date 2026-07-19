import { redirect } from "next/navigation";
import { getVerifiedAdminSession } from "@/lib/firebase/session";
import { EngineMonitorShell } from "@/components/admin/EngineMonitorShell";

export default async function EnginePage() {
  const session = await getVerifiedAdminSession();
  if (!session) redirect("/admin/login");

  return <EngineMonitorShell />;
}
