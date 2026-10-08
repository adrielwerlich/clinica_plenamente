import React, { useEffect, useState } from 'react';
import { Alert, Box, Button, CircularProgress, Container, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import FeedList from '../../components/Admin/FeedList';
import { deleteFeedPost, subscribeAllFeed } from '../../services/feedService';
import { FeedPost } from '../../types/feed';

const FeedDashboard: React.FC = () => {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError(null);
    const timeout = window.setTimeout(() => {
      setLoading(false);
      setError('O carregamento está demorando. Verifique sua conexão e tente novamente.');
    }, 15000);

    const unsubscribe = subscribeAllFeed(list => {
      window.clearTimeout(timeout);
      setPosts(list);
      setLoading(false);
      setError(null);
    }, loadError => {
      debugger;
      window.clearTimeout(timeout);
      setLoading(false);
      setError(loadError.message || 'Não foi possível carregar as publicações do feed.');
    });

    return () => {
      window.clearTimeout(timeout);
      unsubscribe();
    };
  }, [retryKey]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this feed post?')) return;
    await deleteFeedPost(id);
  };

  return (
    <Container>
      <Box sx={{ mt: 4, mb: 2 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/admin')}>
          Voltar ao painel
        </Button>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5">Administração do feed</Typography>
        <Button variant="contained" onClick={() => navigate('/admin/feed/new')}>Nova publicação</Button>
      </Box>
      <Box sx={{ mt: 3, overflowX: 'auto' }}>
        {error && (
          <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => setRetryKey(value => value + 1)}>Tentar novamente</Button>}>
            {error}
          </Alert>
        )}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}><CircularProgress /></Box>
        ) : (
          <FeedList posts={posts} onEdit={id => navigate(`/admin/feed/${id}/edit`)} onDelete={handleDelete} />
        )}
      </Box>
    </Container>
  );
};

export default FeedDashboard;
