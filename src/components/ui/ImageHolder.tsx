import Image from 'next/image';

import { cn } from '@/lib/utils';

type ImageHolderProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  fit?: 'cover' | 'contain';
  className?: string;
};

export default function ImageHolder({
  src,
  alt,
  width,
  height,
  priority,
  fit = 'cover',
  className,
}: ImageHolderProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      sizes={`(max-width: 768px) ${Math.min(width, 380)}px, ${width}px`}
      className={cn(
        'h-full w-full',
        fit === 'contain' ? 'object-contain' : 'object-cover',
        className,
      )}
    />
  );
}
