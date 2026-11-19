import React from "react";
import { ImporClient } from "./ImporClient";

export const metadata = {
  title: "Impor Berkas Komentar – Nara",
  description: "Unggah file CSV atau XLSX untuk analisis sentimen komentar di Nara.",
};

export default function ImporPage() {
  return <ImporClient />;
}
