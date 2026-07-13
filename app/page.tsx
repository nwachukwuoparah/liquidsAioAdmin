import { AUTH_ENTRY_ROUTE } from "@/lib/auth/constants/auth-routes.constant";
import { redirect } from "next/navigation";

export default function Home() {
  return redirect(AUTH_ENTRY_ROUTE);
}