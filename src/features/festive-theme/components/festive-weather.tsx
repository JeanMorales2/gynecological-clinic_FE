"use client";

import { useMemo, type CSSProperties } from "react";
import type { FestiveIconName } from "../data/curated-holidays";
import { useFestiveTheme } from "../hooks/use-festive-theme";
import { useFestivePreview } from "../stores/festive-preview";

type ParticleShape = "snow" | "petal" | "spark";

const shapeByIcon: Record<FestiveIconName, ParticleShape | undefined> = {
  gift: "snow",
  flower: "petal",
  cross: "spark",
  flag: "spark",
};

const densityByShape: Record<ParticleShape, number> = { snow: 34, petal: 20, spark: 16 };

type Particle = { id: number; left: number; duration: number; delay: number; size: number; drift: number; opacity: number };

function buildParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, id) => ({
    id,
    left: Math.random() * 100,
    duration: 10 + Math.random() * 9,
    delay: Math.random() * -18,
    size: 5 + Math.random() * 6,
    drift: (Math.random() - 0.5) * 80,
    opacity: 0.35 + Math.random() * 0.35,
  }));
}

export function FestiveWeather() {
  const { preview } = useFestivePreview();
  const { theme } = useFestiveTheme();

  const active = preview
    ? { icon: preview.icon, accentColor: preview.accentColor }
    : theme?.hasTheme
      ? { icon: theme.icon, accentColor: theme.accentColor }
      : null;

  const shape = active?.icon ? shapeByIcon[active.icon] : undefined;
  const particles = useMemo(() => (shape ? buildParticles(densityByShape[shape]) : []), [shape]);

  if (!shape || !active) return null;

  const particleColor = shape === "snow" ? "#FFFFFF" : active.accentColor;

  return <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
    {particles.map((particle) => (
      <span
        className={`festive-particle festive-particle--${shape}`}
        key={particle.id}
        style={{
          left: `${particle.left}%`,
          width: particle.size,
          height: particle.size,
          backgroundColor: particleColor,
          opacity: particle.opacity,
          animationDuration: `${particle.duration}s`,
          animationDelay: `${particle.delay}s`,
          "--festive-drift": `${particle.drift}px`,
        } as CSSProperties}
      />
    ))}
  </div>;
}
