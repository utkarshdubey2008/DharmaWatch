export interface VideoInfo {
  isVideo: boolean;
  type: 'youtube' | 'vimeo' | 'direct' | 'none';
  embedUrl?: string;
  directUrl?: string;
}

/**
 * Checks whether a URL is a video (YouTube, Vimeo, or direct MP4/WebM/OGG file)
 * and returns embeddable properties.
 */
export function parseVideoUrl(url: string | null | undefined): VideoInfo {
  if (!url || typeof url !== 'string') {
    return { isVideo: false, type: 'none' };
  }
  const clean = url.trim();

  // A video URL must be a single standalone token without spaces or linebreaks
  if (/\s/.test(clean)) {
    return { isVideo: false, type: 'none' };
  }

  // Must start with http://, https://, or an absolute path
  if (!/^(https?:\/\/|\/)/i.test(clean)) {
    return { isVideo: false, type: 'none' };
  }

  // YouTube watch, short, embed, or youtu.be
  const ytMatch = clean.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i
  );
  if (ytMatch && ytMatch[1]) {
    return {
      isVideo: true,
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=0&rel=0`,
    };
  }

  // Vimeo
  const vimeoMatch = clean.match(
    /(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+))/i
  );
  if (vimeoMatch && vimeoMatch[3]) {
    return {
      isVideo: true,
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[3]}`,
    };
  }

  // Image extensions or image flags must never be treated as video
  if (
    /\.(jpe?g|png|webp|gif|svg|avif)(\?.*)?$/i.test(clean) ||
    /(\?|&)(format|type)=image/i.test(clean) ||
    /#image$/i.test(clean) ||
    /17c4981434448bdd3a106077|17c4981434408bd8c05e56ba/i.test(clean)
  ) {
    return { isVideo: false, type: 'none' };
  }

  // Direct MP4 / WebM / Ogg / MOV video link or video download/stream URL
  if (
    /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(clean) ||
    /canon-filetolink|filetolink|file_.*\.bin|\/(dl|watch)\/[a-f0-9]+/i.test(clean)
  ) {
    let directUrl = clean;
    if (/17c4981434428bdeeb2896f1/i.test(clean)) {
      directUrl = '/uploads/shahabad-dairy-sachin-murder.mp4';
    } else if (/canon-filetolink.*\/watch\//i.test(directUrl)) {
      directUrl = directUrl.replace(/\/watch\//i, '/dl/');
    }
    return {
      isVideo: true,
      type: 'direct',
      directUrl,
    };
  }

  return { isVideo: false, type: 'none' };

}
