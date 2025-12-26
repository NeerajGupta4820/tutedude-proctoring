import React, { useState } from 'react';
import axios from 'axios';
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaBriefcase,
  FaGraduationCap,
  FaFileAlt,
  FaCamera,
  FaTimes,
  FaCheck,
  FaSave,
  FaArrowLeft,
  FaSyncAlt,
  FaCloudUploadAlt,
  FaStickyNote,
} from 'react-icons/fa';

const API_URL = 'http://localhost:5000/api';

const Card = ({
  icon: Icon,
  title,
  iconBg = 'bg-blue-50',
  iconBorder = 'border-blue-200',
  iconColor = 'text-blue-600',
  children,
}) => (
  <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-5 hover:border-blue-200 transition-colors">
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

const UpdateCandidate = ({ candidate, onUpdate, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: candidate.name || '',
    email: candidate.email || '',
    phone: candidate.phone || '',
    position: candidate.position || '',
    experience: candidate.experience || 'fresher',
    description: candidate.description || '',
    notes: candidate.notes || '',
    status: candidate.status || 'pending',
  });

  const [files, setFiles] = useState({
    photo: null,
    resume: null,
  });

  const [preview, setPreview] = useState({
    photo: candidate.photo || null,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files: fileList } = e.target;
    if (fileList && fileList[0]) {
      setFiles((prev) => ({ ...prev, [name]: fileList[0] }));

      if (name === 'photo') {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview((prev) => ({ ...prev, photo: reader.result }));
        };
        reader.readAsDataURL(fileList[0]);
      }
    }
  };

  const removePhoto = () => {
    setFiles((prev) => ({ ...prev, photo: null }));
    setPreview((prev) => ({ ...prev, photo: candidate.photo || null }));
  };

  const removeResume = () => {
    setFiles((prev) => ({ ...prev, resume: null }));
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
      Object.keys(formData).forEach((key) => {
        formDataToSend.append(key, formData[key]);
      });

      if (files.photo) {
        formDataToSend.append('photo', files.photo);
      }
      if (files.resume) {
        formDataToSend.append('resume', files.resume);
      }

      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/candidate/${candidate._id}`, formDataToSend, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess('Candidate updated successfully!');
      setTimeout(() => {
        onUpdate();
      }, 1000);
    } catch (err) {
      console.error('Error updating candidate:', err);
      setError(err.response?.data?.message || 'Failed to update candidate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 rounded-lg">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Update Candidate
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Edit candidate information
            </p>
          </div>
          <button
            onClick={onCancel}
            className="flex items-center gap-2 px-4 py-2.5 text-gray-600 bg-white border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-lg text-sm font-medium transition-all"
          >
            <FaArrowLeft size={12} />
            <span>Back</span>
          </button>
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

        <div className="max-w-5xl">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Left Column */}
              <div className="space-y-5">
                <Card icon={FaUser} title="Personal Information">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-100 rounded flex items-center justify-center border border-dashed border-gray-200">
                          <FaUser className="text-gray-400" size={10} />
                        </div>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full pl-12 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-100 rounded flex items-center justify-center border border-dashed border-gray-200">
                          <FaEnvelope className="text-gray-400" size={10} />
                        </div>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full pl-12 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Phone
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-100 rounded flex items-center justify-center border border-dashed border-gray-200">
                          <FaPhone className="text-gray-400" size={10} />
                        </div>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full pl-12 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </Card>

                <Card
                  icon={FaStickyNote}
                  title="Notes"
                  iconBg="bg-yellow-50"
                  iconBorder="border-yellow-200"
                  iconColor="text-yellow-600"
                >
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Internal Notes
                      </label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all resize-none"
                      />
                    </div>
                  </div>
                </Card>
              </div>

              {/* Right Column */}
              <div className="space-y-5">
                <Card
                  icon={FaBriefcase}
                  title="Position Details"
                  iconBg="bg-purple-50"
                  iconBorder="border-purple-200"
                  iconColor="text-purple-600"
                >
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Position
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-100 rounded flex items-center justify-center border border-dashed border-gray-200">
                          <FaBriefcase className="text-gray-400" size={10} />
                        </div>
                        <input
                          type="text"
                          name="position"
                          value={formData.position}
                          onChange={handleInputChange}
                          className="w-full pl-12 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Experience Level
                      </label>
                      <select
                        name="experience"
                        value={formData.experience}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                      >
                        <option value="fresher">Fresher</option>
                        <option value="junior">Junior</option>
                        <option value="mid">Mid-Level</option>
                        <option value="senior">Senior</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Status
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                      >
                        <option value="pending">Pending</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="completed">Completed</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                </Card>

                <Card
                  icon={FaFileAlt}
                  title="Documents"
                  iconBg="bg-indigo-50"
                  iconBorder="border-indigo-200"
                  iconColor="text-indigo-600"
                >
                  <div className="space-y-4">
                    {/* Photo */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Profile Photo
                      </label>
                      <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 bg-gray-50">
                        {preview.photo ? (
                          <div className="flex items-center gap-4">
                            <img
                              src={preview.photo}
                              alt="Preview"
                              className="w-16 h-16 object-cover rounded-xl border-2 border-dashed border-gray-200"
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {files.photo?.name || 'Current photo'}
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
                            {files.photo && (
                              <button
                                type="button"
                                onClick={removePhoto}
                                className="w-8 h-8 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg flex items-center justify-center border border-dashed border-red-200"
                              >
                                <FaTimes size={12} />
                              </button>
                            )}
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
                            </label>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Resume */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Resume
                      </label>
                      <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 bg-gray-50">
                        {files.resume || candidate.resume ? (
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center border-2 border-dashed border-green-200">
                              <FaFileAlt className="text-green-600" size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {files.resume?.name || 'Current resume'}
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
                            {files.resume && (
                              <button
                                type="button"
                                onClick={removeResume}
                                className="w-8 h-8 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg flex items-center justify-center border border-dashed border-red-200"
                              >
                                <FaTimes size={12} />
                              </button>
                            )}
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
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Actions */}
                <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-5">
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={onCancel}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-gray-600 bg-gray-50 border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-xl text-sm font-medium transition-all"
                    >
                      <FaTimes size={12} />
                      <span>Cancel</span>
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Updating...</span>
                        </>
                      ) : (
                        <>
                          <FaSave size={12} />
                          <span>Update Candidate</span>
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

export default UpdateCandidate;
