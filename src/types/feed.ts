export type FeedPostStatus = 'draft' | 'published';
export const FEED_FRAME_ASPECT_RATIO = 4 / 5;
export type FeedImageDisplayMode = 'fit' | 'crop';

export interface FeedCrop {
  x: number;
  y: number;
  width: number;
  height: number;
  aspectRatio: number;
}

export interface FeedImage {
  id?: string;
  base64: string;
  alt?: string;
  order: number;
  crop?: FeedCrop;
  displayMode?: FeedImageDisplayMode;
}

export interface FeedPost {
  id?: string;
  caption: string;
  status: FeedPostStatus;
  imageIds: string[];
  images?: FeedImage[];
  likeCount: number;
  commentCount: number;
  createdAt?: any;
  updatedAt?: any;
  publishedAt?: any;
}
