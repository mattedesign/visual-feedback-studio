
export async function fetchImageAsBase64(imageUrl: string): Promise<{ base64Image: string, mimeType: string }> {
  const imageResponse = await fetch(imageUrl);
  if (!imageResponse.ok) {
    throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
  }
  
  const imageBuffer = await imageResponse.arrayBuffer();
  const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));
  const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg';
  
  return { base64Image, mimeType };
}
