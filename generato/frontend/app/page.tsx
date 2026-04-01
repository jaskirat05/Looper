import Link from "next/link";
import { FeatureGrid } from "@/components/landing/feature-grid";
import { LandingHero } from "@/components/landing/landing-hero";
import { WorkflowPreview } from "@/components/landing/workflow-preview";

const showcaseRows = [
  {
    eyebrow: "Realtime scene systems",
    title: "Build glossy motion pipelines without the drag of a legacy node UI.",
    text: "The landing experience takes density cues from creative AI products, then sharpens them into a cleaner layout with clearer motion, better contrast, and faster wayfinding.",
    stats: ["12ms graph diff", "38 starter blocks", "IR inspector built in"],
  },
  {
    eyebrow: "Compiler-first workflow",
    title: "Every graph becomes a deterministic intermediate representation.",
    text: "Nodes, params, edges, topology, and diagnostics stay visible so teams can debug a graph as a system instead of treating it like an opaque canvas.",
    stats: ["Topological sort", "Cycle checks", "Port validation"],
  },
];

const featurePills = [
  "Prompt choreography",
  "Motion controls",
  "Asset routing",
  "Batch variations",
  "Graph snapshots",
  "Live compile checks",
  "Reusable templates",
  "Team handoff",
];

export default function HomePage() {
  return (
    <main className="shell">
      <section className="promo-bar">
        <span>Realtime creative systems for filmmakers, operators, and AI teams.</span>
        <Link href="/editor">Open editor</Link>
      </section>

      <header className="topbar">
        <div className="brand-lockup">
          <div className="brand-mark">G</div>
          <div>
            <p className="brand-title">Generato</p>
            <p className="brand-subtitle">Cinematic graph engine</p>
          </div>
        </div>

        <nav className="topnav">
          <a href="#capabilities">Capabilities</a>
          <a href="#system">System</a>
          <a href="#footer">Resources</a>
        </nav>

        <div className="topbar-actions">
          <Link className="ghost-button" href="/editor">
            Live graph
          </Link>
          <Link className="primary-button" href="/editor">
            Launch editor
          </Link>
        </div>
      </header>

      <LandingHero />

      <section className="countdown-band">
        <div>
          <p className="band-label">Build window</p>
          <h2>Modern AI workflow surfaces, shaped for fast iteration.</h2>
        </div>
        <div className="countdown-group">
          {[
            ["04", "hours"],
            ["18", "minutes"],
            ["42", "seconds"],
          ].map(([value, label]) => (
            <div className="countdown-card" key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="section-header" id="capabilities">
        <p className="eyebrow">Capability grid</p>
        <h2>One product language across discovery, graphing, and compile output.</h2>
      </section>
      <FeatureGrid />

      <section className="section-stack" id="system">
        {showcaseRows.map((row) => (
          <article className="showcase-card" key={row.title}>
            <div className="showcase-copy">
              <p className="eyebrow">{row.eyebrow}</p>
              <h3>{row.title}</h3>
              <p>{row.text}</p>
              <div className="stat-row">
                {row.stats.map((stat) => (
                  <span className="stat-pill" key={stat}>
                    {stat}
                  </span>
                ))}
              </div>
            </div>
            <WorkflowPreview />
          </article>
        ))}
      </section>

      <section className="tag-cloud">
        <div className="section-header tight">
          <p className="eyebrow">Explore more</p>
          <h2>Design inspiration translated into a cleaner system.</h2>
        </div>
        <div className="pill-grid">
          {featurePills.map((pill) => (
            <span className="tag-pill" key={pill}>
              {pill}
            </span>
          ))}
        </div>
      </section>

      <footer className="footer-panel" id="footer">
        <div className="footer-hero">
          <p>The AI-powered camera control system for fast-moving creative teams.</p>
        </div>
        <div className="footer-links">
          <div>
            <h4>Product</h4>
            <a href="#capabilities">Landing page</a>
            <Link href="/editor">Editor</Link>
            <a href="#system">Compiler</a>
          </div>
          <div>
            <h4>Stack</h4>
            <span>Next.js App Router</span>
            <span>React Flow</span>
            <span>Zustand</span>
          </div>
          <div>
            <h4>Modes</h4>
            <span>Scene assembly</span>
            <span>Compile inspection</span>
            <span>Diagnostics review</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
