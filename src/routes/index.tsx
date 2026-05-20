import { createFileRoute } from "@tanstack/react-router";
import { PathologyApp } from "../components/PathologyApp";

export const Route = createFileRoute("/")({
  component: PathologyApp,
  head: () => ({
    meta: [
      { title: "Pathology Lab Report Generator" },
      {
        name: "description",
        content:
          "Generate printable pathology lab reports with patient details, test selection, and per-test result pages.",
      },
    ],
  }),
});
