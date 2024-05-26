'use client';
import { usePathname } from 'next/navigation';
import React from 'react';
import LoadingBar from 'react-top-loading-bar';

export default function TopProgress() {
  const [progress, setProgress] = React.useState(0);
  const pathname = usePathname();
  React.useEffect(() => {
    setProgress(100);
  }, [pathname]);
  return (
    <LoadingBar
      color='hsl(7.840909090909093, 82.24299065420561%, 58.03921568627452%)'
      progress={progress}
      onLoaderFinished={() => setProgress(0)}
      height={5}
    />
  );
}
