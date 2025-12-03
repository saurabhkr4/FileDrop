import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import {
  AppBar,
  Box,
  Container,
  Toolbar,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Paper
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import FileList from './components/FileList';
import FileUpload from './components/FileUpload';
import FileViewer from './components/FileViewer';
import './App.css';

function App() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:5000/api/files');
      if (!response.ok) throw new Error('Failed to fetch files');
      const data = await response.json();
      setFiles(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleFileUpload = (newFile) => {
    setFiles([newFile, ...files]);
  };

  const handleFileDelete = (fileId) => {
    setFiles(files.filter(file => file.id !== fileId));
  };

  return (
    <Router>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Dropbox Clone
            </Typography>
            <Button
              color="inherit"
              component={Link}
              to="/"
              startIcon={<CloudUploadIcon />}
            >
              My Files
            </Button>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Routes>
            <Route path="/" element={
              <>
                <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
                  <Typography variant="h5" gutterBottom>
                    Upload New File
                  </Typography>
                  <FileUpload onUpload={handleFileUpload} />
                </Paper>

                <Paper elevation={3} sx={{ p: 3 }}>
                  <Typography variant="h5" gutterBottom>
                    My Files
                  </Typography>
                  
                  {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {error}
                    </Alert>
                  )}

                  {loading ? (
                    <Box display="flex" justifyContent="center" p={4}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <FileList 
                      files={files} 
                      onDelete={handleFileDelete}
                      refreshFiles={fetchFiles}
                    />
                  )}
                </Paper>
              </>
            } />
            <Route path="/file/:fileId" element={<FileViewer />} />
          </Routes>
        </Container>
      </Box>
    </Router>
  );
}

export default App;