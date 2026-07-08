import { redirect } from "next/navigation";

export async function POST() {
  const { cookies } = await import("next/headers");
  cookies().set("session", "", { maxAge: 0, path: "/" });
  redirect("/admin/login");
}
