export interface Blog {
  id?: string;
  title: string;
  content: string;
  published: boolean;
  thumbnailId: string;
  thumbnail?: string; // base64 string
  createdAt?: any; // Firestore Timestamp
  updatedAt?: any; // Firestore Timestamp
}

export interface Thumbnail {
  thumbnail: string; // base64 string
  createdAt?: any;
  updatedAt?: any;
}