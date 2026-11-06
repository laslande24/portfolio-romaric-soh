"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { ReactNode } from "react";

/** The role picked on the workbench travels in ?role=, and decides what reads first. */
function useRole() {
  const role = useSearchParams().get("role");
  return role === "frontend" || role === "fullstack" ? role : null;
}

export function RoleOrder({ frontend, fullstack }: { frontend: ReactNode; fullstack: ReactNode }) {
  return useRole() === "fullstack" ? (
    <>
      {fullstack}
      {frontend}
    </>
  ) : (
    <>
      {frontend}
      {fullstack}
    </>
  );
}

/** A link that keeps the reader's role, so the next case study opens the same way. */
export function RoleLink({ href, ...props }: React.ComponentProps<typeof Link> & { href: string }) {
  const role = useRole();
  return <Link href={role ? `${href}?role=${role}` : href} {...props} />;
}
