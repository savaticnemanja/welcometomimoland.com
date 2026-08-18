import type { CSSProperties } from "react";
import manifest from "@/content/image-manifest.json";

export type ImageName = keyof typeof manifest;

type Props = {
  name: ImageName;
  alt: string;
  sizes: string;
  priority?: boolean;
  eager?: boolean;
  className?: string;
  style?: CSSProperties;
};

export function Img({
  name,
  alt,
  sizes,
  priority = false,
  eager = false,
  className,
  style,
}: Props) {
  const image = manifest[name];

  return (
    <img
      src={image.src}
      srcSet={image.srcSet}
      sizes={sizes}
      width={image.width}
      height={image.height}
      alt={alt}
      className={className}
      style={style}
      loading={priority || eager ? "eager" : "lazy"}
      decoding={priority ? "sync" : "async"}
      fetchPriority={priority ? "high" : undefined}
    />
  );
}
