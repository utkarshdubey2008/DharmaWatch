import React from 'react';
import { parseVideoUrl } from '../../utils/mediaUtils';
import { Play } from 'lucide-react';

interface MediaRendererProps {
  url?: string;
  alt?: string;
  className?: string;
  caption?: string;
  aspectRatio?: 'video' | 'square' | 'auto';
  isThumbnail?: boolean;
}

export const MediaRenderer: React.FC<MediaRendererProps> = ({
  url,
  alt = '',
  className = '',
  caption,
  isThumbnail = false,
}) => {
  const [currentUrl, setCurrentUrl] = React.useState(url);

  React.useEffect(() => {
    setCurrentUrl(url);
  }, [url]);

  if (!url) return null;

  const handleImageError = () => {
    if (currentUrl && currentUrl.includes('17c4981434448bdd3a106077')) {
      setCurrentUrl('/uploads/shahabad-dairy-sachin-murder.jpg');
    } else if (currentUrl && currentUrl.includes('17c4981434408bd8c05e56ba')) {
      setCurrentUrl('/uploads/arunima-afghanistan-bamyan.jpg');
    }
  };

  const videoInfo = parseVideoUrl(currentUrl || url);

  if (videoInfo.isVideo) {
    if (isThumbnail) {
      // 1. YouTube thumbnail preview
      if (videoInfo.type === 'youtube') {
        const idMatch = url.match(
          /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i
        );
        const ytThumb = idMatch ? `https://img.youtube.com/vi/${idMatch[1]}/hqdefault.jpg` : url;
        return (
          <div className={`relative w-full h-full overflow-hidden bg-black ${className}`}>
            <img
              src={ytThumb}
              alt={alt}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="w-10 h-10 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110">
                <Play className="w-5 h-5 ml-0.5 fill-white" />
              </span>
            </div>
          </div>
        );
      }

      // 2. Direct video thumbnail preview
      if (videoInfo.type === 'direct' && videoInfo.directUrl) {
        const posterUrl = videoInfo.directUrl.includes('17c4981434ca74dce9bbbdb9')
          ? '/uploads/habra-sonakania-school-namaz.jpg'
          : videoInfo.directUrl.includes('17c4981434cc74d2c9ccac68')
          ? '/uploads/dehradun-armaan-gym-blackmail.jpg'
          : videoInfo.directUrl.includes('17c4981434c074eb41444826')
          ? '/uploads/lucknow-shahnawaz-car-attack.jpg'
          : undefined;

        return (
          <div className={`relative w-full h-full overflow-hidden bg-black ${className}`}>
            <video
              src={videoInfo.directUrl}
              className="w-full h-full object-cover"
              muted
              playsInline
              preload="metadata"
              poster={posterUrl}
              onError={(e) => {
                if (videoInfo.directUrl?.includes('17c4981434ca74dce9bbbdb9')) {
                  e.currentTarget.src = '/uploads/habra-sonakania-school-namaz.mp4';
                } else if (videoInfo.directUrl?.includes('17c4981434cc74d2c9ccac68')) {
                  e.currentTarget.src = '/uploads/dehradun-armaan-gym-blackmail.mp4';
                } else if (videoInfo.directUrl?.includes('17c4981434c074eb41444826')) {
                  e.currentTarget.src = '/uploads/lucknow-shahnawaz-car-attack.mp4';
                }
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="w-10 h-10 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110">
                <Play className="w-5 h-5 ml-0.5 fill-white" />
              </span>
            </div>
          </div>
        );
      }
    }

    // Full interactive video player
    const posterUrl = videoInfo.directUrl?.includes('17c4981434ca74dce9bbbdb9')
      ? '/uploads/habra-sonakania-school-namaz.jpg'
      : videoInfo.directUrl?.includes('17c4981434cc74d2c9ccac68')
      ? '/uploads/dehradun-armaan-gym-blackmail.jpg'
      : videoInfo.directUrl?.includes('17c4981434c074eb41444826')
      ? '/uploads/lucknow-shahnawaz-car-attack.jpg'
      : undefined;

    return (
      <figure className="w-full my-4">
        <div className="relative w-full overflow-hidden bg-black aspect-video">
          {videoInfo.type === 'youtube' || videoInfo.type === 'vimeo' ? (
            <iframe
              src={videoInfo.embedUrl}
              title={alt || 'Embedded video'}
              className="absolute top-0 left-0 w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <video
              src={videoInfo.directUrl}
              controls
              playsInline
              preload="metadata"
              poster={posterUrl}
              className="w-full h-full object-contain"
              onError={(e) => {
                if (videoInfo.directUrl?.includes('17c4981434ca74dce9bbbdb9')) {
                  e.currentTarget.src = '/uploads/habra-sonakania-school-namaz.mp4';
                } else if (videoInfo.directUrl?.includes('17c4981434cc74d2c9ccac68')) {
                  e.currentTarget.src = '/uploads/dehradun-armaan-gym-blackmail.mp4';
                } else if (videoInfo.directUrl?.includes('17c4981434c074eb41444826')) {
                  e.currentTarget.src = '/uploads/lucknow-shahnawaz-car-attack.mp4';
                }
              }}
            >
              Your browser does not support the video tag.
            </video>
          )}
        </div>
        {caption && (
          <figcaption className="text-xs text-gray-500 mt-1.5 font-sans italic text-left">
            {caption}
          </figcaption>
        )}
      </figure>
    );
  }

  // Thumbnail Image
  if (isThumbnail) {
    return (
      <img
        src={currentUrl || url}
        alt={alt}
        className={`w-full h-full object-cover ${className}`}
        loading="lazy"
        onError={handleImageError}
      />
    );
  }

  // Standard Article Image
  return (
    <figure className="w-full">
      <img
        src={currentUrl || url}
        alt={alt}
        className={className || 'w-full h-auto object-cover'}
        loading="lazy"
        onError={handleImageError}
      />
      {caption && (
        <figcaption className="text-xs text-gray-500 mt-1.5 font-sans italic text-left">
          {caption}
        </figcaption>
      )}
    </figure>
  );
};
