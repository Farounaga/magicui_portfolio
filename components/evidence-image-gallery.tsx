"use client";

import * as React from "react";
import { createPortal } from "react-dom";

type EvidenceImage = {
  src: string;
  alt: string;
};

type EvidenceImageGalleryProps = {
  images: EvidenceImage[];
};

export function EvidenceImageGallery({ images }: EvidenceImageGalleryProps) {
  const [activeImage, setActiveImage] = React.useState<EvidenceImage | null>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!activeImage) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveImage(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeImage]);

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        {images.map((image) => (
          <button
            key={image.src}
            type="button"
            onClick={() => setActiveImage(image)}
            className="group border border-border/50 p-2 text-left"
            aria-label={`Agrandir l'image: ${image.alt}`}
          >
            <img
              src={image.src}
              alt={image.alt}
              loading="lazy"
              className="h-auto w-full object-cover transition-transform duration-200 group-hover:scale-[1.01]"
            />
          </button>
        ))}
      </div>

      {mounted && activeImage
        ? createPortal(
            <button
              type="button"
              onClick={() => setActiveImage(null)}
              className="fixed inset-0 z-[200] flex items-center justify-center bg-black/92 p-4"
              aria-label="Fermer l'aperçu de l'image"
            >
              <img
                src={activeImage.src}
                alt={activeImage.alt}
                className="max-h-[92vh] max-w-[96vw] object-contain"
                onClick={(event) => event.stopPropagation()}
              />
            </button>,
            document.body,
          )
        : null}
    </>
  );
}
