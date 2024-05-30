import Image from 'next/image';
import { getPlaiceholder } from 'plaiceholder';

async function getBase64(url: string) {
  try {
    const buffer = await fetch(url).then(async (res) =>
      Buffer.from(await res.arrayBuffer()),
    );

    const { base64 } = await getPlaiceholder(buffer);
    return base64;
  } catch (err) {
    err;
  }
}
type ImageHolderProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  overrideSrc: string;
  priority?:true
};

export default async function ImageHolder({
  src,
  alt,
  width,
  height,
  overrideSrc,
  priority
}: ImageHolderProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      overrideSrc={overrideSrc}
      priority={priority}
      // placeholder='blur'
      // blurDataURL={await getBase64(src)}
      className='object-cover'
    />
  );
}
