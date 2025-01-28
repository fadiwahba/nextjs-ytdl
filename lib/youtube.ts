import ytdl from "ytdl-core";

export const validateYouTubeUrl = (url: string): boolean => {
  return ytdl.validateURL(url);
};

export const getVideoInfo = async (url: string) => {
  const info = await ytdl.getInfo(url);
  return info;
};
