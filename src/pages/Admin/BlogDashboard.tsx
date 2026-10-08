import React, { useEffect, useState } from 'react';
import { Container, Box, Button, Typography, CircularProgress } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import BlogList from '../../components/Admin/BlogList';
import { subscribeAllBlogs, deleteBlog } from '../../services/blogService';
import { Blog } from '../../types/blog';

const BlogDashboard: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = subscribeAllBlogs(list => {
      setBlogs(list);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this blog?')) return;
    await deleteBlog(id);
  };

  return (
    <Container>
      <Box sx={{ mt: 4, mb: 2 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/admin')}>
          Voltar ao painel
        </Button>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">Administração do blog</Typography>
        <Button variant="contained" onClick={() => navigate('/admin/blogs/new')}>Novo artigo</Button>
      </Box>
      <Box sx={{ mt: 3, overflowX: 'auto' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
            <CircularProgress />
          </Box>
        ) : (
          <BlogList blogs={blogs} onEdit={id => navigate(`/admin/blogs/${id}/edit`)} onDelete={handleDelete} />
        )}
      </Box>
    </Container>
  );
};

export default BlogDashboard;
