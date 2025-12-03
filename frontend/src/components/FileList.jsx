import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  Chip,
  Typography
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

const FileList = ({ files, onDelete, refreshFiles }) => {
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDelete = async (fileId) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/files/${fileId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          onDelete(fileId);
        } else {
          alert('Failed to delete file');
        }
      } catch (error) {
        alert('Error deleting file: ' + error.message);
      }
    }
  };

  const handleDownload = async (fileId, filename) => {
    try {
      const response = await fetch(`http://localhost:5000/api/files/${fileId}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      alert('Error downloading file: ' + error.message);
    }
  };

  if (files.length === 0) {
    return (
      <Typography variant="body1" color="textSecondary" align="center" py={4}>
        No files uploaded yet. Upload your first file above!
      </Typography>
    );
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Filename</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Size</TableCell>
            <TableCell>Uploaded</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {files.map((file) => (
            <TableRow key={file.id} hover>
              <TableCell>
                <Typography variant="body2">
                  {file.original_filename}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip 
                  label={file.file_type.toUpperCase()} 
                  size="small" 
                  variant="outlined"
                />
              </TableCell>
              <TableCell>
                {formatFileSize(file.file_size)}
              </TableCell>
              <TableCell>
                {formatDate(file.created_at)}
              </TableCell>
              <TableCell align="center">
                <IconButton
                  component={Link}
                  to={`/file/${file.id}`}
                  size="small"
                  color="primary"
                  title="View"
                >
                  <ViewIcon />
                </IconButton>
                
                <IconButton
                  onClick={() => handleDownload(file.id, file.original_filename)}
                  size="small"
                  color="primary"
                  title="Download"
                >
                  <DownloadIcon />
                </IconButton>
                
                <IconButton
                  onClick={() => handleDelete(file.id)}
                  size="small"
                  color="error"
                  title="Delete"
                >
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default FileList;