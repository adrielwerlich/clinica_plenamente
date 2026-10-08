import React, { useEffect, useRef, useState } from 'react';
import { Alert, Box, Button, Container, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CropIcon from '@mui/icons-material/Crop';
import FitScreenIcon from '@mui/icons-material/FitScreen';
import { useNavigate, useParams } from 'react-router-dom';
import { createFeedPost, getFeedPostById, updateFeedPostWithImages } from '../../services/feedService';
import ReactCrop, { type PercentCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import 'quill/dist/quill.snow.css';
import { FEED_FRAME_ASPECT_RATIO, FeedCrop, FeedImageDisplayMode } from '../../types/feed';

declare global {
  interface Window { Quill: any }
}

interface EditableImage {
  key: string;
  id?: string;
  file?: File;
  preview: string;
  name: string;
  crop?: FeedCrop;
  displayMode: FeedImageDisplayMode;
}

const initialCrop = (imageWidth: number, imageHeight: number): PercentCrop => {
  const imageAspectRatio = imageWidth / imageHeight;
  let width = 90;
  let height = 90;

  if (imageAspectRatio * width / height > FEED_FRAME_ASPECT_RATIO) {
    width = (height * FEED_FRAME_ASPECT_RATIO) / imageAspectRatio;
  } else {
    height = (width * imageAspectRatio) / FEED_FRAME_ASPECT_RATIO;
  }

  return { unit: '%', x: (100 - width) / 2, y: (100 - height) / 2, width, height };
};

const FeedEditor: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [caption, setCaption] = useState('');
  const [images, setImages] = useState<EditableImage[]>([]);
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [cropImageIndex, setCropImageIndex] = useState<number | null>(null);
  const [activeCrop, setActiveCrop] = useState<PercentCrop | undefined>();
  const [cropDimensions, setCropDimensions] = useState<{ width: number; height: number } | null>(null);
  const previewUrls = useRef(new Set<string>());
  const quillRef = useRef<HTMLDivElement>(null);
  const quillInstance = useRef<any>(null);
  const pendingCaption = useRef<string | null>(null);

  useEffect(() => {
    let active = true;

    import('quill').then(({ default: Quill }) => {
      if (!active || !quillRef.current || quillInstance.current) return;

      const editor = new Quill(quillRef.current, {
        theme: 'snow',
        placeholder: 'Digite a legenda...',
        modules: {
          toolbar: [
            [{ header: [2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['link'],
            ['clean'],
          ],
        },
      });
      quillInstance.current = editor;
      editor.on('text-change', (_delta: unknown, _oldDelta: unknown, source: string) => {
        setCaption(editor.root.innerHTML);
        if (source === 'user') setHasUnsavedChanges(true);
      });

      if (pendingCaption.current !== null) {
        editor.clipboard.dangerouslyPasteHTML(pendingCaption.current);
        pendingCaption.current = null;
      }
    });

    return () => {
      active = false;
      quillInstance.current = null;
    };
  }, []);

  useEffect(() => () => {
    previewUrls.current.forEach(url => URL.revokeObjectURL(url));
    previewUrls.current.clear();
  }, []);

  React.useEffect(() => {
    if (!id) return;
    getFeedPostById(id).then(post => {
      if (!post) return;
      setCaption(post.caption);
      setStatus(post.status);
      if (quillInstance.current) {
        quillInstance.current.clipboard.dangerouslyPasteHTML(post.caption || '');
      } else {
        pendingCaption.current = post.caption || '';
      }
      setImages((post.images || []).filter(image => image.id).map((image, index) => ({
        key: image.id || `saved-${index}`,
        id: image.id,
        preview: image.base64,
        name: image.alt || `Imagem ${index + 1}`,
        crop: image.crop,
        displayMode: image.displayMode || 'fit',
      })));
    }).catch(() => setError('Não foi possível carregar a publicação.'));
  }, [id]);

  const addFiles = (selectedFiles: File[]) => {
    setError(null);
    const acceptedFiles = selectedFiles.filter(file => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type));
    if (acceptedFiles.length !== selectedFiles.length) {
      setError('Selecione apenas arquivos JPG, PNG ou WebP.');
    }
    if (images.length + acceptedFiles.length > 10) {
      setError('Um post pode ter no máximo 10 imagens.');
      return;
    }

    const additions = acceptedFiles.map(file => {
      const preview = URL.createObjectURL(file);
      previewUrls.current.add(preview);
      return {
        key: `${file.name}-${file.lastModified}-${Math.random()}`,
        file,
        preview,
        name: file.name,
        displayMode: 'fit' as const,
      };
    });
    if (additions.length) setHasUnsavedChanges(true);
    setImages(current => [...current, ...additions]);
  };

  const removeImage = (key: string) => {
    setHasUnsavedChanges(true);
    setImages(current => {
      const image = current.find(item => item.key === key);
      if (image && previewUrls.current.has(image.preview)) {
        URL.revokeObjectURL(image.preview);
        previewUrls.current.delete(image.preview);
      }
      return current.filter(item => item.key !== key);
    });
  };

  const clearImages = () => {
    if (images.length) setHasUnsavedChanges(true);
    images.forEach(image => {
      if (previewUrls.current.has(image.preview)) {
        URL.revokeObjectURL(image.preview);
        previewUrls.current.delete(image.preview);
      }
    });
    setImages([]);
  };

  const reorderImages = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    setHasUnsavedChanges(true);
    setImages(current => {
      const reordered = [...current];
      const [movedImage] = reordered.splice(fromIndex, 1);
      reordered.splice(toIndex, 0, movedImage);
      return reordered;
    });
  };

  const openCrop = (index: number) => {
    setCropImageIndex(index);
    const savedCrop = images[index].crop;
    setActiveCrop(savedCrop?.aspectRatio === FEED_FRAME_ASPECT_RATIO
      ? { unit: '%', ...savedCrop }
      : undefined);
    setCropDimensions(null);
  };

  const handleCropImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = event.currentTarget;
    setCropDimensions({ width: naturalWidth, height: naturalHeight });
    if (!activeCrop) setActiveCrop(initialCrop(naturalWidth, naturalHeight));
  };

  const resetCrop = () => {
    if (!cropDimensions) return;
    setActiveCrop(initialCrop(cropDimensions.width, cropDimensions.height));
  };

  const applyCrop = () => {
    if (cropImageIndex === null || !activeCrop || !cropDimensions) return;
    const crop: FeedCrop = {
      x: activeCrop.x,
      y: activeCrop.y,
      width: activeCrop.width,
      height: activeCrop.height,
      aspectRatio: FEED_FRAME_ASPECT_RATIO,
    };
    setImages(current => current.map((image, index) => index === cropImageIndex ? { ...image, crop, displayMode: 'crop' } : image));
    setHasUnsavedChanges(true);
    setCropImageIndex(null);
  };

  const save = async (nextStatus: 'draft' | 'published') => {
    setError(null);
    setHasUnsavedChanges(true);
    setSaving(true);
    try {
      if (id) {
        await updateFeedPostWithImages(id, { caption, status: nextStatus }, images.map(({ id: imageId, file, crop, displayMode }) => ({ id: imageId, file, crop, displayMode })));
      } else {
        await createFeedPost(caption, images.flatMap(image => image.file ? [{ file: image.file, crop: image.crop, displayMode: image.displayMode }] : []), nextStatus);
      }
      navigate('/admin/feed');
    } catch (saveError: any) {
      setError(saveError?.message || 'Não foi possível salvar a publicação.');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (hasUnsavedChanges && !window.confirm('Você tem alterações não salvas. Deseja sair sem salvar?')) return;
    navigate('/admin/feed');
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Box>
          <Button startIcon={<ArrowBackIcon />} onClick={handleBack} disabled={saving}>
            Voltar ao feed
          </Button>
        </Box>
        <Typography variant="h5">{id ? 'Editar publicação do feed' : 'Nova publicação do feed'}</Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Legenda</Typography>
          <Box
            ref={quillRef}
            sx={{
              bgcolor: 'background.paper',
              '& .ql-editor': { minHeight: 160, maxHeight: 360, overflowY: 'auto' },
              '& .ql-toolbar': { borderColor: 'divider', borderRadius: '4px 4px 0 0' },
              '& .ql-container': { borderColor: 'divider', borderRadius: '0 0 4px 4px', fontFamily: 'inherit', fontSize: '1rem' },
            }}
          />
        </Box>
        <Button variant="outlined" component="label">
          {id ? 'Adicionar imagens' : 'Selecionar imagens'}
          <input
            hidden
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={event => {
              addFiles(Array.from(event.target.files || []));
              event.target.value = '';
            }}
          />
        </Button>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <Typography color="text.secondary">{images.length} de 10 imagens</Typography>
          <Button color="error" startIcon={<ClearAllIcon />} disabled={!images.length || saving} onClick={clearImages}>
            Remover todas
          </Button>
        </Stack>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 2 }}>
          {images.map((image, index) => (
            <Box
              key={image.key}
              draggable
              onDragStart={event => {
                event.dataTransfer.effectAllowed = 'move';
                event.dataTransfer.setData('text/plain', String(index));
              }}
              onDragOver={event => event.preventDefault()}
              onDrop={event => {
                event.preventDefault();
                const fromIndex = Number(event.dataTransfer.getData('text/plain'));
                if (Number.isInteger(fromIndex)) reorderImages(fromIndex, index);
              }}
              sx={{ position: 'relative', border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden', cursor: 'grab' }}
            >
              <Box sx={{ position: 'relative', aspectRatio: String(FEED_FRAME_ASPECT_RATIO), overflow: 'hidden', bgcolor: 'grey.100' }}>
                {image.displayMode === 'crop' && image.crop ? (
                  <Box
                    component="img"
                    src={image.preview}
                    alt={image.name}
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
                  <Box component="img" src={image.preview} alt={image.name} sx={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                )}
              </Box>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 1, py: .5 }}>
                <Stack direction="row" alignItems="center" spacing={.5}>
                  <DragIndicatorIcon fontSize="small" color="action" />
                  <Typography variant="caption">{index + 1}</Typography>
                </Stack>
                <Stack direction="row" spacing={.5}>
                  <ToggleButtonGroup
                    exclusive
                    size="small"
                    value={image.displayMode}
                    aria-label={`Modo de exibição da imagem ${index + 1}`}
                    onChange={(_event, value: FeedImageDisplayMode | null) => {
                      if (value === 'fit') {
                        setImages(current => current.map((item, itemIndex) => itemIndex === index ? { ...item, displayMode: 'fit' } : item));
                        setHasUnsavedChanges(true);
                      } else if (value === 'crop') {
                        openCrop(index);
                      }
                    }}
                  >
                    <ToggleButton value="fit" aria-label="Ajustar imagem ao quadro" title="Ajustar imagem ao quadro"><FitScreenIcon fontSize="small" /></ToggleButton>
                    <ToggleButton value="crop" aria-label="Recortar para preencher" title="Recortar para preencher"><CropIcon fontSize="small" /></ToggleButton>
                  </ToggleButtonGroup>
                  <IconButton size="small" aria-label={`Remover imagem ${index + 1}`} disabled={saving} onClick={() => removeImage(image.key)}>
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Stack>
            </Box>
          ))}
        </Box>
        <Dialog open={cropImageIndex !== null} onClose={() => setCropImageIndex(null)} maxWidth="md" fullWidth>
          <DialogTitle>Ajustar recorte da imagem</DialogTitle>
          <DialogContent>
            {cropImageIndex !== null && images[cropImageIndex] && (
              <Box sx={{ display: 'flex', justifyContent: 'center', bgcolor: 'grey.100', p: 2, maxHeight: '70vh', overflow: 'auto' }}>
                <ReactCrop
                  aspect={FEED_FRAME_ASPECT_RATIO}
                  crop={activeCrop}
                  keepSelection
                  ruleOfThirds
                  onChange={(_pixelCrop, percentCrop) => setActiveCrop(percentCrop)}
                >
                  <img
                    key={images[cropImageIndex].key}
                    src={images[cropImageIndex].preview}
                    alt={images[cropImageIndex].name}
                    onLoad={handleCropImageLoad}
                    style={{ display: 'block', maxWidth: '100%', maxHeight: '65vh', objectFit: 'contain' }}
                  />
                </ReactCrop>
              </Box>
            )}
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              Ajuste a área 4:5. Arraste a seleção para mover o recorte ou use as alças para redimensioná-lo.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={resetCrop} disabled={!cropDimensions}>Redefinir recorte 4:5</Button>
            <Button onClick={() => setCropImageIndex(null)}>Cancelar</Button>
            <Button variant="contained" onClick={applyCrop} disabled={!activeCrop || !cropDimensions}>Aplicar recorte</Button>
          </DialogActions>
        </Dialog>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Button variant="outlined" disabled={saving} onClick={() => { setStatus('draft'); save('draft'); }}>
            Salvar rascunho
          </Button>
          <Button variant="contained" disabled={saving} onClick={() => { setStatus('published'); save('published'); }}>
            Publicar
          </Button>
          <Button disabled={saving} onClick={handleBack}>Cancelar</Button>
        </Stack>
        <Typography variant="caption" color="text.secondary">Status selecionado: {status}</Typography>
      </Stack>
    </Container>
  );
};

export default FeedEditor;
