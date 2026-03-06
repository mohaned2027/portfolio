import { useState } from 'react';
import { apiPost } from '../../api/request';
import { API_CONTACT_CREATE } from '../../api/endpoints';
import { X, Send } from 'lucide-react';

const CreateMailModal = ({ onClose, onSuccess, prefilledEmail = '' }) => {
  const [formData, setFormData] = useState({
    email: prefilledEmail,
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!formData.subject.trim()) {
      setError('Subject is required');
      return;
    }

    if (formData.subject.length > 200) {
      setError('Subject cannot exceed 200 characters');
      return;
    }

    if (!formData.message.trim()) {
      setError('Message is required');
      return;
    }

    if (formData.message.length > 2000) {
      setError('Message cannot exceed 2000 characters');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await apiPost(API_CONTACT_CREATE, {
        email: formData.email,
        subject: formData.subject,
        message: formData.message
      });

      if (response.status === 200 || response.success) {
        onSuccess(response.data);
      } else {
        setError(response.message || 'Failed to create mail');
      }
    } catch (error) {
      console.error('Error creating mail:', error);
      setError(error.message || 'An error occurred while creating the mail');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div 
        className="bg-card border border-border rounded-[20px] w-full max-w-md max-h-[90vh] overflow-y-auto"
        style={{ background: 'var(--bg-gradient-jet)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-inherit">
          <h2 className="h3 text-white-2">Create New Mail</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-onyx/50 rounded-lg transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm">
              {error}
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm text-foreground mb-2">
              Recipient Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="recipient@example.com"
              maxLength="150"
              className="form-input w-full"
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm text-foreground mb-2">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Mail subject"
              maxLength="200"
              className="form-input w-full"
              disabled={isSubmitting}
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              {formData.subject.length}/200 characters
            </p>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm text-foreground mb-2">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Type your message here..."
              maxLength="2000"
              rows="6"
              className="form-input resize-none w-full"
              disabled={isSubmitting}
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              {formData.message.length}/2000 characters
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-onyx/30 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? 'Sending...' : 'Send Mail'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateMailModal;
