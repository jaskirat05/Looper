import type { NodeDefinition } from "@/types/graph";

export const nodeDefinitions: NodeDefinition[] = [
  {
    type: "prompt",
    label: "Prompt Source",
    kind: "source",
    description: "Seed the graph with prompt intent, tone, and scene framing.",
    defaults: {
      prompt: "Neo-noir chase in a rain-soaked city",
      duration: 8,
    },
    tags: ["input", "text", "scene"],
  },
  {
    type: "camera",
    label: "Camera Path",
    kind: "transform",
    description: "Shape movement with dolly, crane, and lens choreography.",
    defaults: {
      lens: "50mm",
      motion: "push-in",
    },
    tags: ["motion", "cinema", "path"],
  },
  {
    type: "style",
    label: "Style Grade",
    kind: "transform",
    description: "Apply a sharper color script and finish to the sequence.",
    defaults: {
      palette: "electric lime",
      contrast: "high",
    },
    tags: ["look", "grade", "visual"],
  },
  {
    type: "switch",
    label: "Branch Switch",
    kind: "logic",
    description: "Route graph execution based on scene mode or operator intent.",
    defaults: {
      condition: "heroVariant",
      fallback: true,
    },
    tags: ["logic", "routing", "conditional"],
  },
  {
    type: "render",
    label: "Render Output",
    kind: "output",
    description: "Finalize the graph into a production-ready output target.",
    defaults: {
      format: "4k-prores",
      fps: 24,
    },
    tags: ["export", "output", "delivery"],
  },
  {
    type: "audio",
    label: "Audio Bed",
    kind: "source",
    description: "Inject timing and energy from a soundtrack or sonic motif.",
    defaults: {
      track: "synthetic pulse",
      ducking: true,
    },
    tags: ["sound", "music", "input"],
  },
];
