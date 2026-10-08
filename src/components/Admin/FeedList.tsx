import React, { useState } from 'react';
import { Box, IconButton, Modal, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ImageNotSupportedIcon from '@mui/icons-material/ImageNotSupported';
import CloseIcon from '@mui/icons-material/Close';
import { FeedPost } from '../../types/feed';

interface Props {
  posts: FeedPost[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const formatDate = (value: any) => value?.toDate ? value.toDate().toLocaleString() : '-';
const getCaptionPreview = (caption: string) => {
  const document = new DOMParser().parseFromString(caption, 'text/html');
  const text = document.body.textContent?.replace(/\s+/g, ' ').trim() || '';
  return text || 'Sem legenda';
};
const truncate = (text: string, limit: number) => text.length > limit ? `${text.slice(0, limit).trimEnd()}...` : text;

const FeedList: React.FC<Props> = ({ posts, onEdit, onDelete }) => {
  const [openImage, setOpenImage] = useState<string | null>(null);

  return (
    <>
      <Table sx={{ minWidth: 760 }}>
        <TableHead>
          <TableRow>
            <TableCell>Thumbnail</TableCell>
            <TableCell>Content</TableCell>
            <TableCell>Created</TableCell>
            <TableCell>Updated</TableCell>
            <TableCell>Published</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {posts.length === 0 ? (
            <TableRow><TableCell colSpan={6} align="center">No feed posts available.</TableCell></TableRow>
          ) : posts.map(post => {
            const thumbnail = post.images?.[0]?.base64;
            const content = getCaptionPreview(post.caption);
            const tooltipContent = truncate(content, 400);
            return (
              <TableRow key={post.id}>
                <TableCell>
                  {thumbnail ? (
                    <img src={thumbnail} alt={content} onClick={() => setOpenImage(thumbnail)} style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 4, cursor: 'pointer' }} />
                  ) : (
                    <Box display="flex" alignItems="center" justifyContent="center" width={60} height={40} bgcolor="#f5f5f5" borderRadius={1}>
                      <ImageNotSupportedIcon sx={{ fontSize: 24, color: 'grey.500' }} />
                    </Box>
                  )}
                </TableCell>
                <TableCell sx={{ maxWidth: 280 }}>
                  <Tooltip
                    arrow
                    placement="top-start"
                    enterDelay={250}
                    title={(
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                        {tooltipContent}
                      </Typography>
                    )}
                    slotProps={{
                      tooltip: {
                        sx: {
                          maxWidth: 360,
                          p: 1.5,
                          bgcolor: 'grey.900',
                          boxShadow: 4,
                          '& .MuiTypography-root': { color: 'common.white' },
                        },
                      },
                      transition: { timeout: 180 },
                    }}
                  >
                    <Box
                      component="span"
                      tabIndex={0}
                      aria-label={`Content preview: ${tooltipContent}`}
                      sx={{
                        display: 'inline-block',
                        maxWidth: '100%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        cursor: 'help',
                        transition: 'color 160ms ease',
                        '&:hover, &:focus-visible': { color: 'primary.main' },
                      }}
                    >
                      {truncate(content, 20)}
                    </Box>
                  </Tooltip>
                </TableCell>
                <TableCell>{formatDate(post.createdAt)}</TableCell>
                <TableCell>{formatDate(post.updatedAt)}</TableCell>
                <TableCell>{post.status === 'published' ? 'Yes' : 'No'}</TableCell>
                <TableCell>
                  <IconButton size="small" aria-label="Edit feed post" onClick={() => post.id && onEdit(post.id)}><EditIcon /></IconButton>
                  <IconButton size="small" aria-label="Delete feed post" onClick={() => post.id && onDelete(post.id)}><DeleteIcon color="error" /></IconButton>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <Modal open={!!openImage} onClose={() => setOpenImage(null)} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh', outline: 'none' }}>
          <IconButton onClick={() => setOpenImage(null)} sx={{ position: 'absolute', top: -40, right: 0, color: 'white' }}><CloseIcon /></IconButton>
          <img src={openImage || ''} alt="Full size feed thumbnail" style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 8 }} />
        </Box>
      </Modal>
    </>
  );
};

export default FeedList;
