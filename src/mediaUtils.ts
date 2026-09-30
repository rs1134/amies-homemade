export const isVideoUrl = (url: string): boolean => /\.(mp4|mov|webm)(\?|#|$)/i.test(url);
