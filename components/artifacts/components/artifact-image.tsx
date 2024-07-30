import React, { useState } from 'react';
import Image from 'next/image';
import { Artifact } from "@/app/lib/definitions/definitions";
import { THUMBNAIL_CONFIGS } from '@/app/lib/image-processing/image-processing';

interface ArtifactImageProps {
  artifact: Artifact;
  size: 'small' | 'medium' | 'large';
}

const ColorSwatch: React.FC<{ colors: string[] }> = ({ colors }) => (
  <div className="flex h-full w-full">
    {colors.map((color, index) => (
      <div key={index} className="flex-1" style={{ backgroundColor: color }} />
    ))}
  </div>
);

export const ArtifactImage: React.FC<ArtifactImageProps> = ({ artifact, size }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const content = artifact.contents.find(c => c.type === 'image');
  if (!content || !content.metadata || content.type !== 'image') {
    return null; // or a placeholder
  }

  const src = content.metadata.variations[size] || content.metadata.variations.compressed;

  return (
    <div className="relative">
        {!imageLoaded && content.metadata.dominantColors && (
        <ColorSwatch colors={content.metadata.dominantColors} />
        )}
        <Image
        src={src}
        alt={artifact.name}
        width={THUMBNAIL_CONFIGS[size].width}
        height={THUMBNAIL_CONFIGS[size].height}
        layout="responsive"
        onLoad={() => setImageLoaded(true)}
        />
    </div>
    );
};