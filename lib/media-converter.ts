import ytdl from "ytdl-core";

export const validateYouTubeUrl = (url: string): boolean => {
  return ytdl.validateURL(url);
};

export const extractVideoId = (url: string): string | null => {
  try {
    const urlObject = new URL(url);
    const videoId = urlObject.searchParams.get("v");
    return videoId || null;
  } catch {
    return null;
  }
};

export const getVideoMetadata = async (url: string) => {
  try {
    const videoInfo = await ytdl.getInfo(url);
    return {
      title: videoInfo.videoDetails.title,
      lengthSeconds: videoInfo.videoDetails.lengthSeconds,
      thumbnail: videoInfo.videoDetails.thumbnails[0].url,
    };
  } catch {
    return null;
  }
};
