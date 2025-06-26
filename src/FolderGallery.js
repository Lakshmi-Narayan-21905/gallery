import React, { useState, useEffect } from 'react';
import './FolderGallery.css';

function FolderGallery() {
  const [folders, setFolders] = useState(() => {
    try {
      const savedFolders = localStorage.getItem('photoGalleryFolders');
      return savedFolders ? JSON.parse(savedFolders) : {};
    } catch (error) {
      console.error("Failed to parse folders from localStorage", error);
      return {};
    }
  });

  const [folderName, setFolderName] = useState('');
  const [selectedFolder, setSelectedFolder] = useState(null);

  // Save folders to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('photoGalleryFolders', JSON.stringify(folders));
    } catch (error) {
      console.error("Failed to save folders to localStorage", error);
    }
  }, [folders]);

  // Handle folder creation
  const handleCreateFolder = (e) => {
    e.preventDefault();
    if (folderName && !folders[folderName]) {
      setFolders({ ...folders, [folderName]: [] });
      setFolderName('');
    }
  };

  // Handle folder deletion
  const handleDeleteFolder = (folderName) => {
    if (window.confirm(`Are you sure you want to delete the folder "${folderName}" and all its images?`)) {
      const newFolders = { ...folders };
      delete newFolders[folderName];
      setFolders(newFolders);
      if (selectedFolder === folderName) {
        setSelectedFolder(null);
      }
    }
  };

  // Handle image deletion
  const handleDeleteImage = (folderName, imageIndex) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      setFolders(prev => ({
        ...prev,
        [folderName]: prev[folderName].filter((_, index) => index !== imageIndex)
      }));
    }
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!selectedFolder || files.length === 0) return;
    Promise.all(files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (ev) => resolve(ev.target.result);
        reader.readAsDataURL(file);
      });
    })).then(images => {
      setFolders(prev => ({
        ...prev,
        [selectedFolder]: [...prev[selectedFolder], ...images]
      }));
    });
  };

  return (
    <div className="folder-gallery">
      <h2>📁 Photo Gallery</h2>
      
      <form onSubmit={handleCreateFolder} className="create-folder-form">
        <input
          type="text"
          value={folderName}
          onChange={e => setFolderName(e.target.value)}
          placeholder="Enter folder name..."
          required
        />
        <button type="submit">Create Folder</button>
      </form>

      <div className="folders-container">
        {Object.keys(folders).length === 0 && (
          <div className="no-content">No folders created yet. Create your first folder above!</div>
        )}
        {Object.keys(folders).map(name => (
          <div key={name} className="folder-item">
            <button
              onClick={() => setSelectedFolder(name)}
              className={`folder-button ${selectedFolder === name ? 'selected' : ''}`}
            >
              📁 {name}
            </button>
            <button
              onClick={() => handleDeleteFolder(name)}
              className="delete-folder-btn"
              title="Delete folder"
            >
              🗑️
            </button>
          </div>
        ))}
      </div>

      {selectedFolder && (
        <div className="folder-content">
          <div className="folder-header">
            <h3>📂 {selectedFolder}</h3>
            <button
              onClick={() => handleDeleteFolder(selectedFolder)}
              className="delete-folder-btn-large"
              title="Delete folder"
            >
              🗑️ Delete Folder
            </button>
          </div>
          
          <div className="file-upload">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              id="image-upload"
            />
            <label htmlFor="image-upload">
              📸 Upload Images
            </label>
          </div>

          <div className="images-grid">
            {folders[selectedFolder].length === 0 && (
              <div className="no-content">No images in this folder yet. Upload some images above!</div>
            )}
            {folders[selectedFolder].map((img, idx) => (
              <div key={idx} className="image-item">
                <img src={img} alt={`${idx + 1}`} />
                <button
                  onClick={() => handleDeleteImage(selectedFolder, idx)}
                  className="delete-image-btn"
                  title="Delete image"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default FolderGallery; 