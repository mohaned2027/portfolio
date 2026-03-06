import { useState } from 'react';
import { apiMultipart } from '../../api/request';
import { API_CONTACT_REPLY } from '../../api/endpoints';
import { X, Send, Paperclip } from 'lucide-react';

const ReplyModal = ({ message, onClose, onSuccess }) => {
  const [replyMessage, setReplyMessage] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [attachmentName, setAttachmentName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'zip', 'rar'];
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setAttachment(null);
      setAttachmentName('');
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError('File size must not exceed 5MB');
      setAttachment(null);
      setAttachmentName('');
      return;
    }

    // Validate file type
    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
      setError(`File type not allowed. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}`);
      setAttachment(null);
      setAttachmentName('');
      return;
    }

    setError('');
    setAttachment(file);
    setAttachmentName(file.name);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!replyMessage.trim()) {
      setError('Reply message is required');
      return;
    }

    if (replyMessage.length > 2000) {
      setError('Message cannot exceed 2000 characters');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const data = {
        message: replyMessage
      };

      if (attachment) {
        data.attachment = attachment;
      }

      const response = await apiMultipart(
        `${API_CONTACT_REPLY}/${message.id}`,
        data
      );

      if (response.status === 200 || response.success) {
        setSuccess('Reply sent successfully!');
        setReplyMessage('');
        setAttachment(null);
        setAttachmentName('');
        
        // Close modal after 2 seconds
        setTimeout(() => {
          onSuccess();
        }, 2000);
      } else {
        setError(response.message || 'Failed to send reply');
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      setError(error.message || 'An error occurred while sending your reply');
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
          <h2 className="h3 text-white-2">Reply to {message.name}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-onyx/50 rounded-lg transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-500 text-sm">
              {success}
            </div>
          )}

          {/* Original Message Preview */}
          <div className="bg-onyx/30 rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-2">Original Message</p>
            <p className="text-sm text-foreground line-clamp-3">{message.message}</p>
          </div>

          {/* Reply Message */}
          <div>
            <label className="block text-sm text-foreground mb-2">
              Your Reply <span className="text-red-500">*</span>
            </label>
            <textarea
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              placeholder="Type your reply here..."
              maxLength="2000"
              rows="6"
              className="form-input resize-none"
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {replyMessage.length}/2000 characters
            </p>
          </div>

          {/* File Attachment */}
          <div>
            <label className="block text-sm text-foreground mb-2">
              Attachment <span className="text-muted-foreground text-xs">(Optional)</span>
            </label>
            <div className="relative">
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
                className="hidden"
                id="file-input"
                disabled={isSubmitting}
              />
              <label
                htmlFor="file-input"
                className="flex items-center gap-2 p-3 border border-border rounded-lg cursor-pointer hover:bg-onyx/30 transition-colors"
              >
                <Paperclip className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground flex-1">
                  {attachmentName || 'Choose a file (max 5MB)'}
                </span>
              </label>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Allowed: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, ZIP, RAR
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
              disabled={isSubmitting || !replyMessage.trim()}
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? 'Sending...' : 'Send Reply'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReplyModal;
