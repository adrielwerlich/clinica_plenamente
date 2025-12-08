import React, { useState } from 'react';
import { Blog } from '../../types/blog';
import { Table, TableBody, TableCell, TableHead, TableRow, IconButton, Box, Modal } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageNotSupportedIcon from '@mui/icons-material/ImageNotSupported';
import CloseIcon from '@mui/icons-material/Close';

interface Props {
  blogs: Blog[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const BlogList: React.FC<Props> = ({ blogs, onEdit, onDelete }) => {
  const [openImage, setOpenImage] = useState<string | null>(null);

  return (
    <>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Thumbnail</TableCell>
            <TableCell>Title</TableCell>
            <TableCell>Created</TableCell>
            <TableCell>Updated</TableCell>
            <TableCell>Published</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {blogs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} align="center">
                No blogs available.
              </TableCell>
            </TableRow>
          ) : (
            blogs.map(b => (
              <TableRow key={b.id}>
                <TableCell>
                  {b.thumbnail ? (
                    <img
                      src={b.thumbnail}
                      alt={b.title}
                      style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 4, cursor: 'pointer' }}
                      onClick={() => setOpenImage(b.thumbnail!)}
                    />
                  ) : (
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      width={60}
                      height={40}
                      bgcolor="#f5f5f5"
                      borderRadius={1}
                    >
                      <ImageNotSupportedIcon sx={{ fontSize: 24, color: 'grey.500' }} />
                    </Box>
                  )}
                </TableCell>
                <TableCell>{b.title}</TableCell>
                <TableCell>{b.createdAt?.toDate ? b.createdAt.toDate().toLocaleString() : '-'}</TableCell>
                <TableCell>{b.updatedAt?.toDate ? b.updatedAt.toDate().toLocaleString() : '-'}</TableCell>
                <TableCell>{b.published ? 'Yes' : 'No'}</TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => b.id && onEdit(b.id)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" onClick={() => b.id && onDelete(b.id)}>
                    <DeleteIcon color="error" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Image Modal */}
      <Modal
        open={!!openImage}
        onClose={() => setOpenImage(null)}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Box
          sx={{
            position: 'relative',
            maxWidth: '90vw',
            maxHeight: '90vh',
            outline: 'none',
          }}
        >
          <IconButton
            onClick={() => setOpenImage(null)}
            sx={{
              position: 'absolute',
              top: -40,
              right: 0,
              color: 'white',
            }}
          >
            <CloseIcon />
          </IconButton>
          <img
            src={openImage || ''}
            alt="Full size thumbnail"
            style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 8 }}
          />
        </Box>
      </Modal>
    </>
  );
};

export default BlogList;