import React, { useEffect, useRef, useState } from 'react';
import {
  Container,
  Box,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
// Import Quill's CSS
import 'quill/dist/quill.snow.css';
import { createBlog, updateBlog, getBlogById } from 'services/blogService';

import DeleteIcon from '@mui/icons-material/Delete';
import './BlogEditor.css';

// You must have Quill installed: npm install quill
declare global {
  interface Window { Quill: any }
}

const BlogEditor: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [published, setPublished] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');

  const quillRef = useRef<HTMLDivElement>(null);
  const quillInstance = useRef<any>(null);
  const pendingContent = useRef<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    import('quill').then(({ default: Quill }) => {
      if (quillRef.current && !quillInstance.current) {
        quillInstance.current = new Quill(quillRef.current, {
          theme: 'snow',
          placeholder: 'Digite o conteúdo...',
          modules: {
            toolbar: [
              [{ header: [1, 2, 3, false] }],
              ['bold', 'italic', 'underline', 'strike'],
              [{ list: 'ordered' }, { list: 'bullet' }],
              ['link', 'image', 'code-block'],
              ['clean'],
            ],
          },
        });
        quillInstance.current.on('text-change', () => {
          setContent(quillInstance.current.root.innerHTML);
        });
        // If blog content already loaded, set it
        if (pendingContent.current) {
          quillInstance.current.clipboard.dangerouslyPasteHTML(pendingContent.current);
          pendingContent.current = null;
        }
      }
    });

    return () => {
      isMounted = false;
      quillInstance.current = null;
    };
  }, []);

  useEffect(() => {
    if (id && id !== 'new') {
      setLoading(true);
      getBlogById(id)
        .then(blog => {
          // console.log(blog);
          setTitle(blog.title || '');
          setPublished(!!blog.published);
          setContent(blog.content || '');
          // If Quill is loaded, set editor HTML
          if (quillInstance.current) {
            quillInstance.current.clipboard.dangerouslyPasteHTML(blog.content || '');
          } else {
            pendingContent.current = blog.content || '';
          }
        })
        .catch(() => setError('Erro ao carregar blog'))
        .finally(() => { setLoading(false) });
    }
  }, [id]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    setSaving(true);
    try {
      if (!title.trim()) throw new Error('Title required');
      const plain = content.replace(/<[^>]+>/g, '').trim();
      if (!plain) throw new Error('Content required');

      if (!id || id === 'new') {
        await createBlog(
          {
            title: title.trim(),
            content: content.trim(),
            published
          },
          thumbnail
        );
      } else {
        await updateBlog(
          id,
          {
            title: title.trim(),
            content: content.trim(),
            published
          },
          thumbnail
        );
      }
      navigate('/admin');
    } catch (err: any) {
      if (err?.message?.includes('too large')) {
        setError('A imagem é muito grande. Por favor, escolha uma imagem menor.');
      } else {
        setError(err?.message || 'Erro ao salvar');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, position: 'relative' }}>
        <Typography variant="h6">{id && id !== 'new' ? 'Edit Blog' : 'New Blog'}</Typography>
        {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}
        <Box sx={{ position: 'relative' }}>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: 'grid', gap: 2, mt: 2, opacity: loading ? 0.5 : 1 }}
          >
            <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth />
            <div
              ref={quillRef}
              style={{
                minHeight: 300,
                maxHeight: 500,
                overflowY: 'auto',
                border: '1px solid #ccc',
                borderRadius: 4,
                background: '#fff',
              }}
            />
            <FormControlLabel
              control={<Checkbox checked={published} onChange={(e) => setPublished(e.target.checked)} />}
              label="Published"
            />
            <Box sx={{ mb: 2 }}>
              <h3 style={{ marginTop: 0 }}> Blog Thumbnail </h3>
              {!thumbnailPreview && (
                <Button variant="outlined" component="label">
                  Upload Thumbnail
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={e => {
                      const file = e.target.files?.[0] || null;
                      setThumbnail(file);
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = ev => setThumbnailPreview(ev.target?.result as string);
                        reader.readAsDataURL(file);
                      } else {
                        setThumbnailPreview('');
                      }
                    }}
                  />
                </Button>
              )}
              {thumbnailPreview && (
                <Box
                  className="thumbnail-preview"
                  sx={{ mt: 2, position: 'relative', display: 'inline-block' }}
                >
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    style={{ maxWidth: 200, borderRadius: 8, display: 'block' }}
                  />
                  <Box
                    className="thumbnail-delete-btn"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      bgcolor: 'rgba(255,255,255,0.7)',
                      borderRadius: '50%',
                      zIndex: 2,
                      display: 'none',
                    }}
                  >
                    <Button
                      size="large"
                      color="error"
                      sx={{ minWidth: 0, p: 0 }}
                      onClick={() => {
                        setThumbnail(null);
                        setThumbnailPreview('');
                      }}
                    >
                      <DeleteIcon fontSize="medium" />
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
              <Button variant="contained" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
              <Button variant="outlined" onClick={() => navigate('/admin')}>Cancel</Button>
            </Box>
          </Box>
          {loading && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                bgcolor: 'rgba(255,255,255,0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
              }}
            >
              <CircularProgress />
            </Box>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default BlogEditor;