import React from 'react';
import { Blog } from '../../types/blog';
import { Table, TableBody, TableCell, TableHead, TableRow, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface Props {
  blogs: Blog[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const BlogList: React.FC<Props> = ({ blogs, onEdit, onDelete }) => {
  return (
    <Table>
      <TableHead>
        <TableRow>
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
  );
};

export default BlogList;