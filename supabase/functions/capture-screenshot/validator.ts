
export const validateUrl = (url: string): void => {
  try {
    const urlObj = new URL(url);
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      throw new Error('Invalid URL protocol');
    }
  } catch {
    throw new Error('Invalid URL provided');
  }
};
