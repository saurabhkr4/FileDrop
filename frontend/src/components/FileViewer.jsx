import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Divider,
  IconButton
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
  TextFields as TextIcon,
  Image as ImageIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';

const FileViewer = () => {
  const { fileId } = useParams();
  const navigate = useNavigate();
  const [fileData, setFileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('text');

  useEffect(() => {
    fetchFileData();
  }, [fileId]);

  const fetchFileData = async () => {
    try {
      setLoading(true);
      setError(null);

      // First get file metadata
      const metadataResponse = await fetch(`http://localhost:5000/api/files`);
      if (!metadataResponse.ok) throw new Error('Failed to fetch file metadata');
      const allFiles = await metadataResponse.json();
      const fileMetadata = allFiles.find(f => f.id === fileId);

      if (!fileMetadata) {
        throw new Error('File not found');
      }

      // For text files, fetch content
      if (['txt', 'json'].includes(fileMetadata.file_type)) {
        const contentResponse = await fetch(`http://localhost:5000/api/files/${fileId}/view`);
        if (contentResponse.ok) {
          const contentData = await contentResponse.json();
          setFileData({ ...fileMetadata, content: contentData.content });
          setViewMode('text');
        } else {
          setFileData(fileMetadata);
          setViewMode('metadata');
        }
      } else {
        setFileData(fileMetadata);
        setViewMode('preview');
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!fileData) return;

    try {
      const response = await fetch(`http://localhost:5000/api/files/${fileId}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileData.original_filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      alert('Error downloading file: ' + error.message);
    }
  };

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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        action={
          <Button color="inherit" size="small" onClick={() => navigate('/')}>
            Go Back
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }

  if (!fileData) {
    return (
      <Alert severity="warning">
        File not found
      </Alert>
    );
  }

  const renderFileContent = () => {
    switch (viewMode) {
      case 'text':
        return (
          <Paper variant="outlined" sx={{ p: 2, mt: 2, bgcolor: '#f5f5f5' }}>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
              {fileData.content}
            </pre>
          </Paper>
        );

      case 'preview':
        if (['jpg', 'jpeg', 'png', 'gif'].includes(fileData.file_type)) {
          return (
            <Box mt={2} display="flex" justifyContent="center">
              <img
                src={`http://localhost:5000/api/files/${fileId}`}
                alt={fileData.original_filename}
                style={{ maxWidth: '100%', maxHeight: '500px', objectFit: 'contain' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNFNUU1RTUiLz48cGF0aCBkPSJNNTAgNzVMMTAwIDEyNUwxNTAgNzVIMTUwVjEyNUg1MFY3NUg1MFoiIGZpbGw9IiNDQ0NDQ0MiLz48L3N2Zz4=';
                }}
              />
            </Box>
          );
        }
        return (
          <Paper variant="outlined" sx={{ p: 4, mt: 2, textAlign: 'center' }}>
            <DescriptionIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body1" color="textSecondary">
              Preview not available for {fileData.file_type.toUpperCase()} files.
              <br />
              Please download the file to view its contents.
            </Typography>
          </Paper>
        );

      default:
        return null;
    }
  };

  const getFileIcon = () => {
    switch (fileData.file_type) {
      case 'txt':
      case 'json':
        return <TextIcon sx={{ mr: 1 }} />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <ImageIcon sx={{ mr: 1 }} />;
      default:
        return <DescriptionIcon sx={{ mr: 1 }} />;
    }
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton component={Link} to="/" sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          File Details
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
          <Box>
            <Box display="flex" alignItems="center" mb={1}>
              {getFileIcon()}
              <Typography variant="h5" component="h2">
                {fileData.original_filename}
              </Typography>
            </Box>
            <Typography variant="body2" color="textSecondary">
              Type: {fileData.file_type.toUpperCase()} • Size: {formatFileSize(fileData.file_size)}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Uploaded: {formatDate(fileData.created_at)}
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
          >
            Download
          </Button>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>
          {viewMode === 'text' ? 'File Content' : 
           viewMode === 'preview' ? 'Preview' : 'File Information'}
        </Typography>

        {renderFileContent()}

        <Box mt={3}>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            File ID: {fileData.id}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default FileViewer;