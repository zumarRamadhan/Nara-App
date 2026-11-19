import React from "react";
import { HasilClient } from "./HasilClient";

export function generateStaticParams() {
  return [
    { id: "ANL_000077" },
    { id: "ANL_000076" },
    { id: "ANL_000075" },
    { id: "ANL_000074" },
    { id: "ANL_000073" },
    { id: "ANL_000072" },
    { id: "ANL_000071" },
  ];
}

export default async function HasilAnalisisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  return <HasilClient id={resolvedParams.id} />;
}
