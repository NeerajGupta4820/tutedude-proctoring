import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiRefreshCw } from 'react-icons/fi';

const API_URL = 'http://localhost:5000/api';

const CreateCandidate = ({ onCandidateCreated }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    experience: 'fresher',
    description: '',
    notes: '',
    password: '',
  });
  const [files, setFiles] = useState({
    photo: null,
    resume: null,
  });
  const [preview, setPreview] = useState({
    photo: null,
  });

  // Generate random password
  const generateRandomPassword = () => {
    const length = 12;
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({
      ...prev,
      password: password,
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const { name, files: fileList } = e.target;

    if (fileList && fileList[0]) {
      setFiles((prev) => ({
        ...prev,
        [name]: fileList[0],
      }));

      if (name === 'photo') {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview((prev) => ({
            ...prev,
            photo: reader.result,
          }));
        };
        reader.readAsDataURL(fileList[0]);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.name || !formData.email) {
        setError('Name and email are required');
        setLoading(false);
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('position', formData.position);
      formDataToSend.append('experience', formData.experience);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('notes', formData.notes);
      formDataToSend.append('password', formData.password);

      if (files.photo) {
        formDataToSend.append('photo', files.photo);
      }
      if (files.resume) {
        formDataToSend.append('resume', files.resume);
      }

      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/candidate/create`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setFormData({
        name: '',
        email: '',
        phone: '',
        position: '',
        experience: 'fresher',
        description: '',
        notes: '',
        password: '',
      });
      setFiles({
        photo: null,
        resume: null,
      });
      setPreview({
        photo: null,
      });

      onCandidateCreated();
      alert('Candidate created successfully!');
    } catch (err) {
      console.error('Error creating candidate:', err);
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        'Failed to create candidate';
      setError(errorMsg);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Create New Candidate</h2>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow p-6 space-y-4"
      >
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Position
              </label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Frontend Developer"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Experience Level
              </label>
              <select
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="fresher">Fresher</option>
                <option value="junior">Junior</option>
                <option value="mid">Mid</option>
                <option value="senior">Senior</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="flex gap-1">
                <input
                  type="text"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Generate or enter"
                />
                <button
                  type="button"
                  onClick={generateRandomPassword}
                  className="px-2 py-2 bg-green-500 hover:bg-green-600 text-white text-sm rounded-lg flex items-center justify-center transition-colors"
                  title="Generate random password"
                >
                  <FiRefreshCw size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Details */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Additional Details</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Additional information about the candidate..."
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Internal notes..."
              />
            </div>
          </div>
        </div>

        {/* File Uploads */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Documents</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photo
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                {preview.photo ? (
                  <div className="text-center">
                    <img
                      src={preview.photo}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg mx-auto mb-4"
                    />
                    <input
                      type="file"
                      name="photo"
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                      id="photoInput"
                    />
                    <label
                      htmlFor="photoInput"
                      className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
                    >
                      Change Photo
                    </label>
                  </div>
                ) : (
                  <div className="text-center">
                    <input
                      type="file"
                      name="photo"
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                      id="photoInput"
                    />
                    <label
                      htmlFor="photoInput"
                      className="text-sm text-gray-600 hover:text-gray-800 cursor-pointer block"
                    >
                      Click to upload photo
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Resume Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resume
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                {files.resume ? (
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">
                      {files.resume.name}
                    </p>
                    <input
                      type="file"
                      name="resume"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      id="resumeInput"
                    />
                    <label
                      htmlFor="resumeInput"
                      className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
                    >
                      Change Resume
                    </label>
                  </div>
                ) : (
                  <div className="text-center">
                    <input
                      type="file"
                      name="resume"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      id="resumeInput"
                    />
                    <label
                      htmlFor="resumeInput"
                      className="text-sm text-gray-600 hover:text-gray-800 cursor-pointer block"
                    >
                      Click to upload resume (PDF, DOC, DOCX)
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4 justify-end">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Creating...' : 'Create Candidate'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCandidate;
