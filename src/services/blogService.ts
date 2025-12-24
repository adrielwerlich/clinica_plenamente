import {
  collection,
  query,
  orderBy,
  where,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  serverTimestamp,
  DocumentData,
  QuerySnapshot,
} from 'firebase/firestore';
// import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '../firebase/firebase';
import { Blog, Thumbnail } from '../types/blog';

const blogsCol = collection(db, 'blogs');
const thumbnailCol = collection(db, 'thumbnails');

// Compress and convert image to base64, max size ~1MB
export async function compressImageToBase64(file: File, maxSizeKB = 900, maxWidth = 800): Promise<string> {

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Scale down if wider than maxWidth
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        let quality = 0.9;
        let base64 = canvas.toDataURL('image/jpeg', quality);

        // Reduce quality until under maxSizeKB
        while (base64.length > maxSizeKB * 1024 && quality > 0.1) {
          quality -= 0.1;
          base64 = canvas.toDataURL('image/jpeg', quality);
        }

        if (base64.length > maxSizeKB * 1024) {
          reject(new Error('Image too large even after compression'));
        } else {
          resolve(base64);
        }
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function subscribeToPublishedBlogs(callback: (blogs: Blog[]) => void) {
  const q = query(blogsCol, where('published', '==', true), orderBy('createdAt', 'desc'));
  return onSnapshot(q, async (snapshot: QuerySnapshot<DocumentData>) => {
    const blogs = snapshot.docs.map(d => ({ id: d.id, ...(d.data() as Blog) }));


    for (const blog of blogs) {
      if (blog.thumbnailId) {
        blog.thumbnail = await getThumbnailById(blog.thumbnailId);
      }
    }

    callback(blogs);
  });
}


export function subscribeAllBlogs(callback: (blogs: Blog[]) => void) {
  const q = query(blogsCol, orderBy('createdAt', 'desc'));
  return onSnapshot(q, async (snapshot: QuerySnapshot<DocumentData>) => {
    const blogs = snapshot.docs.map(d => ({ id: d.id, ...(d.data() as Blog) }));


    for (const blog of blogs) {
      if (blog.thumbnailId) {
        blog.thumbnail = await getThumbnailById(blog.thumbnailId);
      }
    }

    callback(blogs);
  });
}

export async function getThumbnailById(thumbnailId: string): Promise<string | null> {
  if (!thumbnailId) return null;
  const ref = doc(db, 'thumbnails', thumbnailId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data().thumbnail;
}

export async function getBlogById(id: string) {
  const ref = doc(db, 'blogs', id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const blog = { id: snap.id, ...(snap.data() as Blog) };
  if (blog.thumbnailId) {
    blog.thumbnail = await getThumbnailById(blog.thumbnailId);
  }
  return blog;
}

export async function createBlog(data: Partial<Blog>, thumbnailFile?: File) {

  let thumbnailBase64 = '';
  if (thumbnailFile) {
    thumbnailBase64 = await compressImageToBase64(thumbnailFile);
  }

  let ref = await addDoc(thumbnailCol, { thumbnail: thumbnailBase64 });

  let payload = {
    title: data.title || '',
    content: data.content || '',
    published: !!data.published,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    thumbnailId: ref.id,
  };

  ref = await addDoc(blogsCol, payload);
  return ref.id;
}

export async function updateBlog(id: string, data: Partial<Blog>, thumbnailFile?: File) {

  let thumbnailBase64 = '', thumbRef, blogRef = doc(db, 'blogs', id);
  if (thumbnailFile) {
    thumbnailBase64 = await compressImageToBase64(thumbnailFile);
    thumbRef = await addDoc(thumbnailCol, { thumbnail: thumbnailBase64 });

    const blogSnap = await getDoc(blogRef);

    if (blogSnap.exists()) {
      const blogData = blogSnap.data();

      // Delete thumbnail if exists
      if (blogData.thumbnailId) {
        const thumbRef = doc(db, 'thumbnails', blogData.thumbnailId);
        await deleteDoc(thumbRef);
      }
    }

    data.thumbnailId = thumbRef.id;
  }

  const payload: any = {
    ...data,
    updatedAt: serverTimestamp(),
  };


  await updateDoc(blogRef, payload);
}

export async function deleteBlog(id: string) {
  const blogRef = doc(db, 'blogs', id);
  const blogSnap = await getDoc(blogRef);

  if (blogSnap.exists()) {
    const blogData = blogSnap.data();

    // Delete thumbnail if exists
    if (blogData.thumbnailId) {fsubs
      debugger;
      const thumbRef = doc(db, 'thumbnails', blogData.thumbnailId);
      await deleteDoc(thumbRef);
    }
  }

  await deleteDoc(blogRef);
}