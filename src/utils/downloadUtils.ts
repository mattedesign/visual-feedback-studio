export const downloadFile = (content: string, filename: string, contentType: string = 'text/html') => {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const generateWireframeFilename = (sessionId: string): string => {
  const timestamp = new Date().toISOString().split('T')[0];
  return `figmant-wireframe-${sessionId.substring(0, 8)}-${timestamp}.html`;
};