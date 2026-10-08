import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type DocumentData,
  type QuerySnapshot,
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { compressImageToBase64 } from './blogService';
import { FeedCrop, FeedImage, FeedImageDisplayMode, FeedPost } from '../types/feed';

const postsCollection = collection(db, 'feedPosts');
const imagesCollection = collection(db, 'feedImages');

async function loadImages(imageIds: string[]): Promise<FeedImage[]> {
  const images: Array<FeedImage | null> = await Promise.all(imageIds.map(async (imageId, index) => {
    const imageSnapshot = await getDoc(doc(db, 'feedImages', imageId));
    if (!imageSnapshot.exists()) return null;

    return {
      id: imageSnapshot.id,
      ...(imageSnapshot.data() as Omit<FeedImage, 'id'>),
      order: imageSnapshot.data().order ?? index,
    } as FeedImage;
  }));

  return (images.filter(Boolean) as FeedImage[])
    .sort((first, second) => first.order - second.order);
}

async function mapPost(snapshot: DocumentData, id: string): Promise<FeedPost> {
  const post = snapshot as FeedPost;
  return {
    id,
    ...post,
    images: await loadImages(post.imageIds || []),
    likeCount: post.likeCount || 0,
    commentCount: post.commentCount || 0,
  };
}

export function subscribeToPublishedFeed(callback: (posts: FeedPost[]) => void, onError?: (error: Error) => void) {
  const feedQuery = query(
    postsCollection,
    where('status', '==', 'published'),
    orderBy('publishedAt', 'desc'),
  );

  return onSnapshot(
    feedQuery,
    async (snapshot: QuerySnapshot<DocumentData>) => {
      try {
        const posts = await Promise.all(snapshot.docs.map(item => mapPost(item.data(), item.id)));
        callback(posts);
      } catch (error) {
        onError?.(error instanceof Error ? error : new Error('Unable to load feed posts.'));
      }
    },
    error => onError?.(error),
  );
}

export function subscribeAllFeed(callback: (posts: FeedPost[]) => void, onError?: (error: Error) => void) {
  const feedQuery = query(postsCollection, orderBy('createdAt', 'desc'));

  return onSnapshot(
    feedQuery,
    async (snapshot: QuerySnapshot<DocumentData>) => {
      try {
        const posts = await Promise.all(snapshot.docs.map(item => mapPost(item.data(), item.id)));
        callback(posts);
      } catch (error) {
        onError?.(error instanceof Error ? error : new Error('Unable to load feed posts.'));
      }
    },
    error => onError?.(error),
  );
}

export interface FeedImageUpload {
  file: File;
  crop?: FeedCrop;
  displayMode?: FeedImageDisplayMode;
}

export async function createFeedPost(caption: string, images: FeedImageUpload[], status: 'draft' | 'published' = 'draft') {
  if (!images.length) throw new Error('Adicione pelo menos uma imagem.');
  if (images.length > 10) throw new Error('Um post pode ter no máximo 10 imagens.');

  const imageReferences = [];
  for (const [index, image] of images.entries()) {
    const base64 = await compressImageToBase64(image.file, 700, 1200);
    const imageReference = await addDoc(imagesCollection, {
      base64,
      order: index,
      displayMode: image.displayMode || 'fit',
      ...(image.crop ? { crop: image.crop } : {}),
      createdAt: serverTimestamp(),
    });
    imageReferences.push(imageReference.id);
  }

  const postReference = await addDoc(postsCollection, {
    caption: caption.trim(),
    status,
    imageIds: imageReferences,
    likeCount: 0,
    commentCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    publishedAt: status === 'published' ? serverTimestamp() : null,
  });

  return postReference.id;
}

export async function updateFeedPost(id: string, data: Partial<FeedPost>) {
  await updateDoc(doc(db, 'feedPosts', id), {
    caption: data.caption?.trim() || '',
    status: data.status || 'draft',
    updatedAt: serverTimestamp(),
    ...(data.status === 'published' ? { publishedAt: serverTimestamp() } : {}),
  });
}

export interface FeedImageUpdate {
  id?: string;
  file?: File;
  crop?: FeedCrop;
  displayMode?: FeedImageDisplayMode;
}

export async function updateFeedPostWithImages(
  id: string,
  data: Partial<FeedPost>,
  orderedImages: FeedImageUpdate[],
) {
  if (orderedImages.length > 10) throw new Error('Um post pode ter no máximo 10 imagens.');
  if (data.status === 'published' && orderedImages.length === 0) {
    throw new Error('Adicione pelo menos uma imagem antes de publicar.');
  }

  const postReference = doc(db, 'feedPosts', id);
  const postSnapshot = await getDoc(postReference);
  if (!postSnapshot.exists()) throw new Error('Publicação não encontrada.');

  const previousImageIds = (postSnapshot.data() as FeedPost).imageIds || [];
  const nextImageIds: string[] = [];

  for (const [index, image] of orderedImages.entries()) {
    if (image.id) {
      nextImageIds.push(image.id);
      await updateDoc(doc(db, 'feedImages', image.id), {
        order: index,
        displayMode: image.displayMode || 'fit',
        ...(image.crop ? { crop: image.crop } : { crop: null }),
      });
      continue;
    }

    if (!image.file) throw new Error('Imagem inválida na publicação.');
    const base64 = await compressImageToBase64(image.file, 700, 1200);
    const imageReference = await addDoc(imagesCollection, {
      base64,
      order: index,
      displayMode: image.displayMode || 'fit',
      ...(image.crop ? { crop: image.crop } : {}),
      createdAt: serverTimestamp(),
    });
    nextImageIds.push(imageReference.id);
  }

  await updateDoc(postReference, {
    caption: data.caption?.trim() || '',
    status: data.status || 'draft',
    imageIds: nextImageIds,
    updatedAt: serverTimestamp(),
    ...(data.status === 'published' ? { publishedAt: serverTimestamp() } : {}),
  });

  const removedImageIds = previousImageIds.filter(imageId => !nextImageIds.includes(imageId));
  await Promise.all(removedImageIds.map(imageId => deleteDoc(doc(db, 'feedImages', imageId))));
}

export async function deleteFeedPost(id: string) {
  const postReference = doc(db, 'feedPosts', id);
  const postSnapshot = await getDoc(postReference);

  if (!postSnapshot.exists()) return;

  const post = postSnapshot.data() as FeedPost;
  await Promise.all((post.imageIds || []).map(imageId => deleteDoc(doc(db, 'feedImages', imageId))));
  await deleteDoc(postReference);
}

export async function getFeedPostById(id: string) {
  const postSnapshot = await getDoc(doc(db, 'feedPosts', id));
  if (!postSnapshot.exists()) return null;
  return mapPost(postSnapshot.data(), postSnapshot.id);
}
