// User Comment Types - Simple annotation system for user feedback
export interface UserComment {
  id: string;
  x: number;
  y: number;
  comment: string;
  imageUrl?: string;
  imageIndex?: number;
  createdAt?: Date;
}

export interface ImageComments {
  imageUrl: string;
  comments: UserComment[];
}

// Helper functions for user comments
export const createUserComment = (
  x: number, 
  y: number, 
  comment: string, 
  imageUrl?: string,
  imageIndex?: number
): UserComment => ({
  id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  x,
  y,
  comment: comment.trim(),
  imageUrl,
  imageIndex,
  createdAt: new Date()
});

export const getUserCommentsForImage = (
  imageComments: ImageComments[], 
  imageUrl: string
): UserComment[] => {
  const imageCommentsData = imageComments.find(ic => ic.imageUrl === imageUrl);
  return imageCommentsData?.comments || [];
};