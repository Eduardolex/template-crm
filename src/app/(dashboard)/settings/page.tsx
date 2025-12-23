import { redirect } from "next/navigation";

export default function SettingsPage() {
  // Redirect to team by default
  redirect("/settings/team");
}
