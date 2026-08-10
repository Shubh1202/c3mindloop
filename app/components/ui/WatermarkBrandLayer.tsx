import React from 'react';
import Image from 'next/image';

interface WatermarkBrandLayerProps {
  imageSrc?: string;
  position?: 'top-right' | 'top-left' | 'center' | 'bottom-right';
  size?: number | string;
  opacityClass?: string;
  animateSpin?: boolean;
  className?: string;
}

export const WatermarkBrandLayer: React.FC<WatermarkBrandLayerProps> = ({
  imageSrc = '/cube.svg',
  position = 'top-right',
  size = 480,
  opacityClass = 'opacity-10',
  className = '',
}) => {
  let positionClasses = 'right-0 top-0';

  if (position === 'top-left') {
    positionClasses = 'left-0 top-0';
  } else if (position === 'center') {
    positionClasses = 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2';
  } else if (position === 'bottom-right') {
    positionClasses = 'right-0 bottom-0';
  }

  return (
    <div
      className={`absolute ${positionClasses} pointer-events-none z-0 select-none ${className}`}
      style={{
        width: typeof size === 'number' ? `${size}px` : size,
        height: typeof size === 'number' ? `${size}px` : size,
        position: 'absolute',
      }}
      aria-hidden="true"
    >
      <Image
        src={imageSrc}
        alt=""
        fill
        className={`object-contain ${opacityClass} pointer-events-none select-none`}
        priority={false}
        unoptimized
      />
    </div>
  );
};
