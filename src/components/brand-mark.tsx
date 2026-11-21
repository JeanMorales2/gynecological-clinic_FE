import Image from "next/image";
import logoFull from "@/assets/logo-full.png";
import logoMark from "@/assets/logo-mark.png";

type BrandMarkProps = { width?: number; className?: string; priority?: boolean };

export function BrandMark({ width = 180, className = "", priority }: BrandMarkProps) {
  const height = Math.round((logoFull.height / logoFull.width) * width);
  return <Image alt="Dra. María Isabela Pavón — Ginecóloga y Obstetra" className={className} height={height} priority={priority} src={logoFull} width={width} />;
}

export function BrandIcon({ size = 32, className = "" }: { size?: number; className?: string }) {
  return <Image alt="" aria-hidden="true" className={className} height={size} src={logoMark} width={size} />;
}
