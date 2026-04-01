const cards = [
  {
    title: "Cinematic presets",
    text: "Scene-led entry points with stronger visual identity and calmer spacing.",
    accent: "rgba(217, 255, 63, 0.42)",
  },
  {
    title: "Prompt to motion",
    text: "Move from prompt source to camera path without dragging through clutter.",
    accent: "rgba(98, 231, 255, 0.36)",
  },
  {
    title: "Style transforms",
    text: "Treat grades, look-dev, and visual passes as explicit graph nodes.",
    accent: "rgba(255, 126, 143, 0.34)",
  },
  {
    title: "Output routes",
    text: "Compile graphs into inspectable execution plans ready for debugging.",
    accent: "rgba(140, 123, 255, 0.42)",
  },
];

export function FeatureGrid() {
  return (
    <section className="feature-grid">
      {cards.map((card) => (
        <article className="feature-card" key={card.title} style={{ ["--card-accent" as string]: card.accent }}>
          <div className="feature-visual" />
          <div className="feature-copy">
            <h3>{card.title}</h3>
            <p>{card.text}</p>
          </div>
        </article>
      ))}
    </section>
  );
}
