"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/edit");
    router.refresh();
  }

  return (
    <Button onClick={handleLogout} variant="ghost" className="text-sm">
      Sign out
    </Button>
  );
}
