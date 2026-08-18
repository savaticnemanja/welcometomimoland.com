"use client";

import { useState } from "react";
import { Img } from "@/components/img";
import { site } from "@/content/site";

export function FilmTrailer() {
  const [playing, setPlaying] = useState(false);

  const poster = (
    <>
      <Img
        name="film-still"
        alt="Miri, Luc and Mimo on a glowing branch of the Great Tree"
        sizes="(max-width: 1180px) 100vw, 1124px"
      />
      <div className="veil" />
      <span className="play" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5.2v13.6L19 12z" />
        </svg>
      </span>
    </>
  );

  if (!site.filmUrl) {
    return (
      <figure className="trailer pending reveal">
        {poster}
        <figcaption className="tag">
          <b>Watch the Film</b>
          <em>Link to follow</em>
        </figcaption>
      </figure>
    );
  }

  if (playing && site.filmEmbedId) {
    return (
      <div className="trailer playing reveal in">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${site.filmEmbedId}?autoplay=1&rel=0&modestbranding=1`}
          title={`${site.filmTitle} — trailer`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <a
      className="trailer reveal"
      href={site.filmUrl}
      target="_blank"
      rel="noopener"
      onClick={(e) => {
        if (!site.filmEmbedId) return;
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        setPlaying(true);
      }}
    >
      {poster}
      <div className="tag">
        <b>Watch the Film</b>
        <i>{site.filmTitle}</i>
      </div>
    </a>
  );
}
