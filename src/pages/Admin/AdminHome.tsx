import React from 'react';
import { Article, RssFeed } from '@mui/icons-material';
import { Box, Button, Card, CardContent, Container, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const AdminHome: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Stack spacing={1} sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Painel administrativo</Typography>
        <Typography color="text.secondary">Escolha qual conteúdo você deseja gerenciar.</Typography>
      </Stack>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3 }}>
        <Card variant="outlined">
          <CardContent sx={{ p: 3 }}>
            <Article color="primary" sx={{ fontSize: 42, mb: 1 }} />
            <Typography variant="h5" gutterBottom>Blog</Typography>
            <Typography color="text.secondary" sx={{ minHeight: 48, mb: 3 }}>
              Crie, edite e publique artigos da clínica.
            </Typography>
            <Button variant="contained" onClick={() => navigate('/admin/blogs')}>Gerenciar blog</Button>
          </CardContent>
        </Card>
        <Card variant="outlined">
          <CardContent sx={{ p: 3 }}>
            <RssFeed color="primary" sx={{ fontSize: 42, mb: 1 }} />
            <Typography variant="h5" gutterBottom>Feed</Typography>
            <Typography color="text.secondary" sx={{ minHeight: 48, mb: 3 }}>
              Organize publicações com imagens e carrosséis.
            </Typography>
            <Button variant="contained" onClick={() => navigate('/admin/feed')}>Gerenciar feed</Button>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default AdminHome;
