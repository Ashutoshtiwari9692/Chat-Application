import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const AvatarUpload = ({ onClose, onUpdate }) => {
  const { user, updateUser } = useAuth();
  const [preview, setPreview] = useState(user?.avatarUrl || '');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', selectedFile);

      const { data } = await api.put('/users/me/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      updateUser({ avatarUrl: data.data.avatarUrl });
      if (onUpdate) onUpdate(data.data.avatarUrl);
      if (onClose) onClose();
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert(error.response?.data?.message || 'Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    setUploading(true);
    try {
      const { data } = await api.delete('/users/me/avatar');
      updateUser({ avatarUrl: data.data.avatarUrl });
      setPreview(data.data.avatarUrl);
      setSelectedFile(null);
      if (onUpdate) onUpdate(data.data.avatarUrl);
    } catch (error) {
      console.error('Error removing avatar:', error);
      alert(error.response?.data?.message || 'Failed to remove avatar');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-4">Update Profile Picture</h2>

        <div className="flex flex-col items-center mb-6">
          <div className="relative mb-4">
            <img
              src={preview}
              alt="Avatar preview"
              className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
            />
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-secondary mb-2"
            disabled={uploading}
          >
            Choose Photo
          </button>

          {selectedFile && (
            <p className="text-sm text-gray-600 mb-2">
              {selectedFile.name}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="btn-primary flex-1"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
          
          <button
            onClick={handleRemove}
            disabled={uploading}
            className="btn-secondary"
          >
            Remove
          </button>
          
          <button
            onClick={onClose}
            disabled={uploading}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvatarUpload;
