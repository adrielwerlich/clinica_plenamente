import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Grid, Card, CardMedia, CardContent, Typography, CircularProgress, Box } from '@mui/material';
import { subscribeBlogs } from '../../services/blogService';
import ImageNotSupportedIcon from '@mui/icons-material/ImageNotSupported';

import './BlogList.css';

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeBlogs(list => {

      setBlogs(list);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) {
    return <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '50vh',
      }}
    >
      <CircularProgress />
    </Box>;
  }

  return (
    <div>
      <Typography
        variant="h4"
        align="center"
        sx={{
          mt: 3,
          mb: 2,
          fontWeight: 700,
          letterSpacing: 1,
          fontFamily: '"Montserrat", "Roboto", "Arial", sans-serif',
          color: 'primary.main'
        }}
      >
        Nossas postagens de saúde mental
      </Typography>
      <Grid container spacing={3} sx={{ mt: 2, p: 2 }}>
        {blogs.map(blog => (
          <Grid size={4} key={blog.id}>
            <Card className="blog-card">
              <Link to={`/blogs/${blog.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <CardMedia
                  component="img"
                  height="140"
                  image={blog.thumbnail || undefined}
                  alt={blog.title}
                  sx={{ display: blog.thumbnail ? 'block' : 'none' }}
                />
                {!blog.thumbnail && (
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    height={140}
                    bgcolor="#f5f5f5"
                  >
                    <ImageNotSupportedIcon sx={{ fontSize: 48, color: 'grey.500' }} />
                  </Box>
                )}
                <CardContent>
                  <Typography variant="h6">{blog.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{blog.excerpt}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    {(() => {
                      const ts = blog.updatedAt || blog.createdAt;
                      if (ts && ts.seconds) {
                        const date = new Date(ts.seconds * 1000);
                        return `Publicado em ${date.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' })}`;
                      }
                      return '';
                    })()}
                  </Typography>
                </CardContent>
              </Link>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default BlogList;