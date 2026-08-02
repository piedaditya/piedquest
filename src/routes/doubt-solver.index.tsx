import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { newId, readThreads } from "@/lib/doubt-store";

export const Route = createFileRoute("/doubt-solver/")({
  ssr: false,
  component: DoubtIndex,
  head: () => ({
    meta: [
      { title: "The Doubt Solver | Piedquest AI Tutor" },
      {
        name: "description",
        content:
          "Ask anything and get mind-blowing, friendly explanations with diagrams from Piedquest's AI tutor — physics, math, coding and more.",
      },
      { property: "og:title", content: "The Doubt Solver | Piedquest AI Tutor" },
      {
        property: "og:description",
        content:
          "A calm, sky-blue AI tutor that explains JEE/NEET physics, math and coding with funny real-life examples and visual diagrams.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function DoubtIndex() {
  const navigate = useNavigate();
  useEffect(() => {
    const existing = readThreads();
    const id = existing[0]?.id ?? newId();
    void navigate({ to: "/doubt-solver/$threadId", params: { threadId: id }, replace: true });
  }, [navigate]);
  return <div className="min-h-screen" style={{ background: "var(--tutor-bg)" }} />;
}
