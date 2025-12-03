import React, { useState } from 'react';
import {
  Box,
  Button,
  LinearProgress,
  Alert,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  InsertDriveFile as FileIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';

const FileUpload = ({ onUpload }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
      setSuccess(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      setUploading(true);
      setError(null);
      setSuccess(null);

      const response = await fetch('http://localhost:5000/api/files/upload', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setSuccess('File uploaded successfully!');
      setSelectedFile(null);
      
      // Clear file input
      document.getElementById('file-upload').value = '';
      
      // Notify parent component
      if (onUpload) {
        onUpload(data);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setError(null);
    setSuccess(null);
    document.getElementById('file-upload').value = '';
  };

  return (
    <Box>
      <input
        accept=".txt,.pdf,.png,.jpg,.jpeg,.gif,.json"
        style={{ display: 'none' }}
        id="file-upload"
        type="file"
        onChange={handleFileSelect}
      />
      
      <label htmlFor="file-upload">
        <Button
          variant="contained"
          component="span"
          startIcon={<CloudUploadIcon />}
          disabled={uploading}
        >
          Choose File
        </Button>
      </label>

      {selectedFile && (
        <Box mt={2}>
          <List dense>
            <ListItem
              secondaryAction={
                <IconButton edge="end" onClick={handleCancel} disabled={uploading}>
                  <CancelIcon />
                </IconButton>
              }
            >
              <ListItemIcon>
                <FileIcon />
              </ListItemIcon>
              <ListItemText
                primary={selectedFile.name}
                secondary={`${(selectedFile.size / 1024).toFixed(2)} KB`}
              />
            </ListItem>
          </List>

          <Box mt={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleUpload}
              disabled={uploading}
              fullWidth
              startIcon={uploading ? null : <CloudUploadIcon />}
            >
              {uploading ? 'Uploading...' : 'Upload File'}
            </Button>
          </Box>
        </Box>
      )}

      {uploading && (
        <Box mt={2}>
          <LinearProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mt: 2 }} icon={<CheckCircleIcon />}>
          {success}
        </Alert>
      )}

      <Typography variant="caption" display="block" sx={{ mt: 2, color: 'text.secondary' }}>
        Supported formats: TXT, PDF, PNG, JPG, JPEG, GIF, JSON
      </Typography>
    </Box>
  );
};

export default FileUpload;