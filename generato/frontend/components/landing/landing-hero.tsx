"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const slides = [
  {
    label: "Scene systems",
    title: "Design cinematic AI flows that feel immediate.",
    text: "Landing composition borrows density from the references, then pushes toward stronger spacing, brighter accents, and a more intentional hierarchy.",
  },
  {
    label: "Modern graphing",
    title: "Move from intent to compiled workflow in one surface.",
    text: "Operators can browse the product, jump into the editor, and inspect an IR without switching design languages.",
  },
  {
    label: "Fast iteration",
    title: "Double-click anywhere to open node search and keep building.",
    text: "The editor interaction model stays light so the canvas remains responsive with realistic graph sizes.",
  },
];

const miniCards = [
  { title: "Prompt orchestration", label: "Source", accent: "rgba(98, 231, 255, 0.45)" },
  { title: "Camera routing", label: "Motion", accent: "rgba(217, 255, 63, 0.42)" },
  { title: "Render inspector", label: "Output", accent: "rgba(140, 123, 255, 0.48)" },
];

export function LandingHero() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 3200);

    return () => window.clearInterval(timer);
  }, []);

  const activeSlide = slides[activeIndex];

  return (
    <section className="hero-panel">
      <div className="hero-copy">
        <p className="eyebrow">AI workflow operating system</p>
        <h1>Sharper visuals. Faster graph thinking.</h1>
        <p>
          Generato is a premium AI workflow concept: part cinematic showcase, part production
          editor. It turns visual inspiration into a focused graph system with deterministic
          compile output.
        </p>

        <div className="hero-actions">
          <Link className="primary-button" href="/editor">
            Build in editor
          </Link>
          <a className="secondary-button" href="#capabilities">
            Explore surfaces
          </a>
        </div>

        <div className="hero-metrics">
          <div className="metric-card">
            <strong>02</strong>
            <span>local routes</span>
          </div>
          <div className="metric-card">
            <strong>100%</strong>
            <span>IR visibility</span>
          </div>
          <div className="metric-card">
            <strong>React Flow</strong>
            <span>low-latency canvas</span>
          </div>
        </div>
      </div>

      <div className="hero-visual">
        <div className="hero-featured">
          <div className="featured-surface">
            <span className="hero-chip">{activeSlide.label}</span>
            <div className="featured-copy">
              <strong>{activeSlide.title}</strong>
              <p>{activeSlide.text}</p>
              <div className="carousel-dots" aria-label="Featured stories">
                {slides.map((slide, index) => (
                  <button
                    aria-label={slide.label}
                    className={index === activeIndex ? "active" : ""}
                    key={slide.label}
                    onClick={() => setActiveIndex(index)}
                    type="button"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mini-grid">
          {miniCards.map((card) => (
            <article className="mini-card" key={card.title} style={{ ["--accent" as string]: card.accent }}>
              <span>{card.label}</span>
              <strong>{card.title}</strong>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
