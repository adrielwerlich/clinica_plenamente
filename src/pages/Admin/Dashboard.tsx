import React, { useEffect, useState } from 'react';
import { Container, Box, Button, Typography, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import BlogList from '../../components/Admin/BlogList';
import { subscribeAllBlogs, deleteBlog } from '../../services/blogService';
import { Blog } from '../../types/blog';

const Dashboard: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = subscribeAllBlogs(list => {
      setBlogs(list);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleEdit = (id: string) => navigate(`/admin/blogs/${id}/edit`);
  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this blog?')) return;
    await deleteBlog(id);
  };

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4 }}>
        <Typography variant="h5">Admin Dashboard - Blogs</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" onClick={() => navigate('/admin/feed/new')}>New Feed Post</Button>
          <Button variant="contained" onClick={() => navigate('/admin/blogs/new')}>New Blog</Button>
        </Box>
      </Box>

      <Box sx={{ mt: 3 }}>
        {loading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '50vh',
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <BlogList blogs={blogs} onEdit={handleEdit} onDelete={handleDelete} />
        )}
      </Box>
    </Container>
  );
};

export default Dashboard;