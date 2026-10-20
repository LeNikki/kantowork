import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { readUserCookie, USER_COOKIE } from "@/lib/session";
import EmployerHome from "@/components/EmployerHome";

export default async function Home() {
  // proxy.ts already blocks signed-out visitors, but it only checks that the
  // token cookie exists. If the user cookie is missing or tampered with,
  // send them back to login rather than rendering a broken shell.
  const user = readUserCookie((await cookies()).get(USER_COOKIE)?.value);

  if (!user) redirect("/login");

  return <EmployerHome user={user} />;
}
