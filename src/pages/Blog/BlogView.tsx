import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Box, CircularProgress } from '@mui/material';
import { getBlogById } from '../../services/blogService';
import { useNavigate } from 'react-router-dom';

const BlogView = () => {
    const navigate = useNavigate();
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBlogById(id)
      .then(data => setBlog(data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  if (!blog) return <Typography sx={{ mt: 4 }}>Blog not found.</Typography>;

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box sx={{ mb: 2 }}>
        <button
          onClick={() => navigate('/blogs')}
          style={{
            padding: '8px 16px',
            borderRadius: 6,
            border: 'none',
            background: '#1976d2',
            color: 'white',
            fontWeight: 500,
            cursor: 'pointer',
            marginBottom: 16
          }}
        >
          ← Voltar para lista
        </button>
      </Box>
      {blog.thumbnail && (
        <Box sx={{ mb: 2 }}>
          <img
            src={blog.thumbnail}
            alt={blog.title}
            style={{
              maxWidth: '100%',
              borderRadius: 8,
              display: 'block',
              margin: '0 auto'
            }}
          />
        </Box>
      )}
      <Typography variant="h4" gutterBottom>{blog.title}</Typography>
      <Typography variant="body1" dangerouslySetInnerHTML={{ __html: blog.content }} />
    </Container>
  );
};

export default BlogView;