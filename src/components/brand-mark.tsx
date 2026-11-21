import Image from "next/image";
import logoFull from "@/assets/logo-full.png";

type BrandMarkProps = { width?: number; className?: string; priority?: boolean };

export function BrandMark({ width = 180, className = "", priority }: BrandMarkProps) {
  const height = Math.round((logoFull.height / logoFull.width) * width);
  return <Image alt="Dra. María Isabela Pavón — Ginecóloga y Obstetra" className={className} height={height} priority={priority} src={logoFull} width={width} />;
}
