import React, { useState } from 'react';
import axios from 'axios';
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaBriefcase,
  FaGraduationCap,
  FaLock,
  FaFileAlt,
  FaCamera,
  FaTimes,
  FaCheck,
  FaRedo,
  FaSave,
  FaArrowLeft,
  FaSyncAlt,
  FaCloudUploadAlt,
  FaUserPlus,
  FaStickyNote,
} from 'react-icons/fa';

const API_URL = 'http://localhost:5000/api';

// ✅ MOVED OUTSIDE - Card Component defined outside the main component
const Card = ({
  icon: Icon,
  title,
  iconBg = 'bg-blue-50',
  iconBorder = 'border-blue-200',
  iconColor = 'text-blue-600',
  children,
  className = '',
}) => (
  <div
    className={`bg-white rounded-xl border-2 border-dashed border-gray-200 p-5 hover:border-blue-200 transition-colors ${className}`}
  >
    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-dashed border-gray-100">
      <div
        className={`w-9 h-9 ${iconBg} rounded-lg flex items-center justify-center border-2 border-dashed ${iconBorder}`}
      >
        <Icon className={iconColor} size={14} />
      </div>
      <h2 className="font-semibold text-gray-900">{title}</h2>
    </div>
    <div className="relative">
      <div className="absolute left-0 top-0 bottom-0 w-px border-l border-dashed border-gray-200" />
      <div className="pl-4">{children}</div>
    </div>
  </div>
);

const CreateCandidate = ({ onCandidateCreated, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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

  const resetForm = () => {
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
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
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
      await axios.post(`${API_URL}/candidate/create`, formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccess('Candidate created successfully!');
      resetForm();
      if (onCandidateCreated) onCandidateCreated();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error creating candidate:', err);
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        'Failed to create candidate';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleExperienceChange = (level) => {
    setFormData((prev) => ({
      ...prev,
      experience: level,
    }));
  };

  const removePhoto = () => {
    setFiles((prev) => ({ ...prev, photo: null }));
    setPreview((prev) => ({ ...prev, photo: null }));
  };

  const removeResume = () => {
    setFiles((prev) => ({ ...prev, resume: null }));
  };

  return (
    <div className="min-h-screen bg-gray-50 rounded-lg">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Create New Candidate
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Add a new candidate to the interview system
            </p>
          </div>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex items-center gap-2 px-4 py-2.5 text-gray-600 bg-white border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-lg text-sm font-medium transition-all"
            >
              <FaArrowLeft size={12} />
              <span>Back</span>
            </button>
          )}
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-5 flex items-center gap-3 p-4 bg-red-50 border-2 border-dashed border-red-200 rounded-xl max-w-5xl">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0 border-2 border-dashed border-red-300">
              <FaTimes className="text-red-500" size={12} />
            </div>
            <span className="text-red-600 text-sm">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-5 flex items-center gap-3 p-4 bg-green-50 border-2 border-dashed border-green-200 rounded-xl max-w-5xl">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 border-2 border-dashed border-green-300">
              <FaCheck className="text-green-500" size={12} />
            </div>
            <span className="text-green-600 text-sm">{success}</span>
          </div>
        )}

        {/* Main Form Container */}
        <div className="max-w-5xl">
          <form onSubmit={handleSubmit}>
            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* ============ LEFT COLUMN ============ */}
              <div className="space-y-5">
                {/* 1. Personal Information Card */}
                <Card icon={FaUser} title="Personal Information">
                  <div className="space-y-4">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-100 rounded flex items-center justify-center border border-dashed border-gray-200 pointer-events-none">
                          <FaUser className="text-gray-400" size={10} />
                        </div>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Enter full name"
                          className="w-full pl-12 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                          required
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-100 rounded flex items-center justify-center border border-dashed border-gray-200 pointer-events-none">
                          <FaEnvelope className="text-gray-400" size={10} />
                        </div>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="Enter email address"
                          className="w-full pl-12 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                          required
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Phone Number
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-100 rounded flex items-center justify-center border border-dashed border-gray-200 pointer-events-none">
                          <FaPhone className="text-gray-400" size={10} />
                        </div>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="Enter phone number"
                          className="w-full pl-12 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Password
                      </label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-100 rounded flex items-center justify-center border border-dashed border-gray-200 pointer-events-none">
                            <FaLock className="text-gray-400" size={10} />
                          </div>
                          <input
                            type="text"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="Generate or enter password"
                            className="w-full pl-12 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={generateRandomPassword}
                          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                          title="Generate random password"
                        >
                          <FaSyncAlt size={12} />
                          <span className="hidden sm:inline">Generate</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* 2. Additional Notes Card */}
                <Card
                  icon={FaStickyNote}
                  title="Additional Notes"
                  iconBg="bg-yellow-50"
                  iconBorder="border-yellow-200"
                  iconColor="text-yellow-600"
                >
                  <div className="space-y-4">
                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="Additional information about the candidate..."
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all resize-none"
                      />
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Internal Notes
                      </label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="Internal notes (not visible to candidate)..."
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all resize-none"
                      />
                    </div>
                  </div>
                </Card>
              </div>

              {/* ============ RIGHT COLUMN ============ */}
              <div className="space-y-5">
                {/* 3. Position Details Card */}
                <Card
                  icon={FaBriefcase}
                  title="Position Details"
                  iconBg="bg-purple-50"
                  iconBorder="border-purple-200"
                  iconColor="text-purple-600"
                >
                  <div className="space-y-4">
                    {/* Position */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Applied Position
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-100 rounded flex items-center justify-center border border-dashed border-gray-200 pointer-events-none">
                          <FaBriefcase className="text-gray-400" size={10} />
                        </div>
                        <input
                          type="text"
                          name="position"
                          value={formData.position}
                          onChange={handleInputChange}
                          placeholder="e.g., Frontend Developer"
                          className="w-full pl-12 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                        />
                      </div>
                    </div>

                    {/* Experience Level */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Experience Level
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-100 rounded flex items-center justify-center border border-dashed border-gray-200 pointer-events-none">
                          <FaGraduationCap
                            className="text-gray-400"
                            size={10}
                          />
                        </div>
                        <select
                          name="experience"
                          value={formData.experience}
                          onChange={handleInputChange}
                          className="w-full pl-12 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all appearance-none cursor-pointer"
                        >
                          <option value="fresher">Fresher (0-1 years)</option>
                          <option value="junior">Junior (1-3 years)</option>
                          <option value="mid">Mid-Level (3-5 years)</option>
                          <option value="senior">Senior (5+ years)</option>
                        </select>
                      </div>
                    </div>

                    {/* Experience Level Visual Indicator */}
                    <div className="grid grid-cols-4 gap-2 mt-3">
                      {['fresher', 'junior', 'mid', 'senior'].map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => handleExperienceChange(level)}
                          className={`p-2 rounded-lg border border-dashed text-xs font-medium capitalize transition-all ${
                            formData.experience === level
                              ? level === 'fresher'
                                ? 'border-green-400 bg-green-50 text-green-700'
                                : level === 'junior'
                                  ? 'border-blue-400 bg-blue-50 text-blue-700'
                                  : level === 'mid'
                                    ? 'border-purple-400 bg-purple-50 text-purple-700'
                                    : 'border-orange-400 bg-orange-50 text-orange-700'
                              : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300'
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                </Card>

                {/* 4. Documents Card */}
                <Card
                  icon={FaFileAlt}
                  title="Documents"
                  iconBg="bg-indigo-50"
                  iconBorder="border-indigo-200"
                  iconColor="text-indigo-600"
                >
                  <div className="space-y-4">
                    {/* Photo Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Profile Photo
                      </label>
                      <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors bg-gray-50">
                        {preview.photo ? (
                          <div className="flex items-center gap-4">
                            <img
                              src={preview.photo}
                              alt="Preview"
                              className="w-16 h-16 object-cover rounded-xl border-2 border-dashed border-gray-200"
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {files.photo?.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {files.photo &&
                                  (files.photo.size / 1024).toFixed(1)}{' '}
                                KB
                              </p>
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
                                className="inline-flex items-center gap-1 mt-1 text-xs text-blue-600 hover:text-blue-800 cursor-pointer font-medium"
                              >
                                <FaSyncAlt size={10} />
                                Change Photo
                              </label>
                            </div>
                            <button
                              type="button"
                              onClick={removePhoto}
                              className="w-8 h-8 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg flex items-center justify-center border border-dashed border-red-200 transition-colors"
                            >
                              <FaTimes size={12} />
                            </button>
                          </div>
                        ) : (
                          <div className="text-center py-4">
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
                              className="cursor-pointer"
                            >
                              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3 border-2 border-dashed border-blue-200">
                                <FaCamera className="text-blue-500" size={18} />
                              </div>
                              <p className="text-sm font-medium text-gray-700">
                                Click to upload photo
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                PNG, JPG up to 5MB
                              </p>
                            </label>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Resume Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Resume / CV
                      </label>
                      <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors bg-gray-50">
                        {files.resume ? (
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center border-2 border-dashed border-green-200">
                              <FaFileAlt className="text-green-600" size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {files.resume.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {(files.resume.size / 1024).toFixed(1)} KB
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
                                className="inline-flex items-center gap-1 mt-1 text-xs text-blue-600 hover:text-blue-800 cursor-pointer font-medium"
                              >
                                <FaSyncAlt size={10} />
                                Change File
                              </label>
                            </div>
                            <button
                              type="button"
                              onClick={removeResume}
                              className="w-8 h-8 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg flex items-center justify-center border border-dashed border-red-200 transition-colors"
                            >
                              <FaTimes size={12} />
                            </button>
                          </div>
                        ) : (
                          <div className="text-center py-4">
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
                              className="cursor-pointer"
                            >
                              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mx-auto mb-3 border-2 border-dashed border-indigo-200">
                                <FaCloudUploadAlt
                                  className="text-indigo-500"
                                  size={18}
                                />
                              </div>
                              <p className="text-sm font-medium text-gray-700">
                                Click to upload resume
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                PDF, DOC, DOCX up to 10MB
                              </p>
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* 5. Action Buttons Card */}
                <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-5 hover:border-blue-200 transition-colors">
                  <div className="flex items-center gap-3 mb-4 pb-3 border-b border-dashed border-gray-100">
                    <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center border-2 border-dashed border-green-200">
                      <FaUserPlus className="text-green-600" size={14} />
                    </div>
                    <h2 className="font-semibold text-gray-900">Actions</h2>
                  </div>

                  {/* Summary */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-semibold border-2 border-dashed border-blue-200">
                        {formData.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {formData.name || 'New Candidate'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {formData.email || 'No email entered'}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium border border-dashed capitalize ${
                          formData.experience === 'fresher'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : formData.experience === 'junior'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : formData.experience === 'mid'
                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                : 'bg-orange-50 text-orange-700 border-orange-200'
                        }`}
                      >
                        {formData.experience}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-gray-600 hover:text-gray-800 bg-gray-50 border-2 border-dashed border-gray-300 hover:border-gray-400 hover:bg-white rounded-xl text-sm font-medium transition-all"
                    >
                      <div className="w-6 h-6 rounded-md flex items-center justify-center border border-dashed border-gray-300">
                        <FaRedo size={10} className="text-gray-500" />
                      </div>
                      <span>Reset</span>
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Creating...</span>
                        </>
                      ) : (
                        <>
                          <div className="w-6 h-6 rounded-md flex items-center justify-center bg-blue-500">
                            <FaSave size={10} />
                          </div>
                          <span>Create Candidate</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateCandidate;
