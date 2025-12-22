// packages/ui/src/lib/video-utils.ts
export async function generateThumbnail(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.src = URL.createObjectURL(file);
    video.preload = "metadata";
    video.muted = true;

    video.onloadedmetadata = () => {
      video.currentTime = 1; // Seek to 1s to avoid black frames
    };

    video.onseeked = () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject("Blob generation failed");
        URL.revokeObjectURL(video.src);
      }, "image/jpeg", 0.7); // 0.7 quality for small file size
    };
  });
}