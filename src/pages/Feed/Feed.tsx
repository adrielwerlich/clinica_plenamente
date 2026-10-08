import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Container,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  FavoriteBorder,
  ModeCommentOutlined,
  ShareOutlined,
} from '@mui/icons-material';
import { FEED_FRAME_ASPECT_RATIO, FeedPost } from '../../types/feed';
import { subscribeToPublishedFeed } from '../../services/feedService';
import { FirebaseError } from 'firebase/app';

const Feed: React.FC = () => {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToPublishedFeed(
      nextPosts => {
        setPosts(nextPosts);
        setLoading(false);
      },
      loadError => {
        console.error('Failed to load published feed:', loadError);
        setError(loadError instanceof FirebaseError && loadError.code === 'permission-denied'
          ? 'O Firestore bloqueou o acesso ao feed. Publique regras que permitam ler publicações e imagens do feed.'
          : 'Não foi possível carregar o feed. Tente novamente mais tarde.');
        setLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;
  }

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 2, sm: 4 } }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Feed</Typography>
          <Typography color="text.secondary">Conteúdos para acompanhar seu cuidado todos os dias.</Typography>
        </Box>

        {error && <Alert severity="error">{error}</Alert>}
        {!error && posts.length === 0 && (
          <Alert severity="info">Ainda não há publicações no feed.</Alert>
        )}

        {posts.map(post => <FeedCard key={post.id} post={post} />)}
      </Stack>
    </Container>
  );
};

const FeedCard: React.FC<{ post: FeedPost }> = ({ post }) => {
  const [activeImage, setActiveImage] = useState(0);
  const images = post.images || [];
  const image = images[activeImage];

  const sharePost = async () => {
    const shareData = { title: 'Clínica Plenamente', text: post.caption, url: window.location.href };
    if (navigator.share) await navigator.share(shareData);
    else await navigator.clipboard?.writeText(window.location.href);
  };

  return (
    <Card sx={{ overflow: 'hidden' }}>
      <Box
        sx={{
          position: 'relative',
          width: 'min(100%, 64vh)',
          maxWidth: '100%',
          aspectRatio: String(FEED_FRAME_ASPECT_RATIO),
          mx: 'auto',
          bgcolor: 'grey.100',
          overflow: 'hidden',
        }}
      >
        {image ? (
          image.displayMode === 'crop' && image.crop ? (
            <Box
              component="img"
              src={image.base64}
              alt={image.alt || 'Publicação da Clínica Plenamente'}
              sx={{
                position: 'absolute',
                  width: `${10000 / image.crop.width}%`,
                  height: `${10000 / image.crop.height}%`,
                  left: `${(-100 * image.crop.x) / image.crop.width}%`,
                  top: `${(-100 * image.crop.y) / image.crop.height}%`,
                  maxWidth: 'none',
              }}
            />
          ) : (
            <CardMedia component="img" image={image.base64} alt={image.alt || 'Publicação da Clínica Plenamente'} sx={{ display: 'block', width: '100%', height: '100%', objectFit: 'contain' }} />
          )
        ) : (
          <Box sx={{ display: 'grid', placeItems: 'center', width: '100%', height: '100%' }}><Typography color="text.secondary">Imagem indisponível</Typography></Box>
        )}
        {images.length > 1 && (
          <>
            <IconButton aria-label="Imagem anterior" onClick={() => setActiveImage((activeImage - 1 + images.length) % images.length)} sx={{ position: 'absolute', left: 8, top: '50%', bgcolor: 'rgba(255,255,255,.85)' }}><ChevronLeft /></IconButton>
            <IconButton aria-label="Próxima imagem" onClick={() => setActiveImage((activeImage + 1) % images.length)} sx={{ position: 'absolute', right: 8, top: '50%', bgcolor: 'rgba(255,255,255,.85)' }}><ChevronRight /></IconButton>
            <Typography sx={{ position: 'absolute', right: 12, top: 12, px: 1, py: .25, borderRadius: 2, bgcolor: 'rgba(0,0,0,.6)', color: 'white', fontSize: 12 }}>{activeImage + 1}/{images.length}</Typography>
          </>
        )}
      </Box>
      <CardContent>
        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
          <IconButton aria-label="Curtir"><FavoriteBorder /></IconButton>
          <IconButton aria-label="Comentar"><ModeCommentOutlined /></IconButton>
          <IconButton aria-label="Compartilhar" onClick={sharePost}><ShareOutlined /></IconButton>
        </Stack>
        <Typography
          component="div"
          variant="body1"
          sx={{
            '& p': { my: 0 },
            '& p + p': { mt: 1 },
            '& ul, & ol': { pl: 3, my: 1 },
          }}
          dangerouslySetInnerHTML={{ __html: post.caption }}
        />
      </CardContent>
    </Card>
  );
};

export default Feed;
