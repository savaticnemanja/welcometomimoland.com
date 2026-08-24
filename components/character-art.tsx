import { Img, type ImageName } from "@/components/img";

type Props = {
  name: string;
  image: ImageName;
  alt: string;
  objectPosition?: string;
  videoUrl?: string;
};

/* Characters with an intro turn their card art into a link out to YouTube;
   the rest render the same frame with a "To Be Continued" note instead. */
export function CharacterArt({ name, image, alt, objectPosition, videoUrl }: Props) {
  const art = (
    <Img
      name={image}
      alt={alt}
      sizes="(max-width: 640px) 100vw, (max-width: 900px) 50vw, 365px"
      style={objectPosition ? { objectPosition } : undefined}
    />
  );

  if (!videoUrl) {
    return (
      <div className="art-img">
        {art}
        <div className="veil" />
        <span className="soon">To Be Continued</span>
      </div>
    );
  }

  return (
    <a
      className="art-img"
      href={videoUrl}
      target="_blank"
      rel="noopener"
      aria-label={`Watch the ${name} intro on YouTube`}
    >
      {art}
      <div className="veil" />
      <span className="play" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5.2v13.6L19 12z" />
        </svg>
      </span>
    </a>
  );
}
