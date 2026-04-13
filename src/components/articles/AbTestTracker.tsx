"use client";

import { useEffect } from "react";

interface Props {
  testId: string;
  variant: "A" | "B";
}

export default function AbTestTracker({ testId, variant }: Props) {
  useEffect(() => {
    fetch(`/api/admin/ab-tests/${testId}/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variant }),
    }).catch(() => {});
  }, [testId, variant]);

  return null;
}
