import Image from 'next/image';

type ImageHolderProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
};

export default function ImageHolder({
  src,
  alt,
  width,
  height,
  priority,
}: ImageHolderProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      sizes={`(max-width: 768px) ${Math.min(width, 380)}px, ${width}px`}
      className='h-full w-full object-cover'
    />
  );
}
