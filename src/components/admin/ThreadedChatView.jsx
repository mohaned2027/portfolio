import { useState, useEffect, useRef } from 'react';
import { apiPatch, apiDelete, apiMultipart } from '../../api/request';
import { getContactReadEndpoint, getContactDeleteEndpoint, getContactReplyEndpoint } from '../../api/endpoints';
import { X, Send, Paperclip, Trash2, Plus } from 'lucide-react';

const ThreadedChatView = ({ message, onClose, onRefresh, onCreateMail }) => {
  const [messages, setMessages] = useState([message]);
  const [replyText, setReplyText] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [attachmentName, setAttachmentName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const messagesEndRef = useRef(null);

  const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'zip', 'rar'];
  const MAX_FILE_SIZE = 5 * 1024 * 1024;

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark as read on open
  useEffect(() => {
    if (message && !message.is_read) {
      handleMarkAsRead();
    }
  }, [message?.id]);

  const handleMarkAsRead = async () => {
    try {
      await apiPatch(getContactReadEndpoint(message.id), {});
      setMessages(prev => prev.map(m => 
        m.id === message.id ? { ...m, is_read: true } : m
      ));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setAttachment(null);
      setAttachmentName('');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('File size must not exceed 5MB');
      setAttachment(null);
      setAttachmentName('');
      return;
    }

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

  const handleSendReply = async (e) => {
    e.preventDefault();

    if (!replyText.trim()) {
      setError('Reply message is required');
      return;
    }

    if (replyText.length > 2000) {
      setError('Message cannot exceed 2000 characters');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const data = {
        message: replyText
      };

      if (attachment) {
        data.attachment = attachment;
      }

      const response = await apiMultipart(
        getContactReplyEndpoint(message.id),
        data
      );

      if (response.status === 200 || response.success) {
        const newMessage = {
          ...response.data,
          id: Math.floor(Math.random() * 10000),
          created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, newMessage]);
        setReplyText('');
        setAttachment(null);
        setAttachmentName('');
        setSuccess('Reply sent successfully!');
        setTimeout(() => setSuccess(''), 3000);
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

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this entire conversation?')) return;

    try {
      await apiDelete(getContactDeleteEndpoint(message.id));
      onRefresh();
      onClose();
    } catch (error) {
      console.error('Error deleting conversation:', error);
      setError('Failed to delete conversation');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div 
        className="bg-card border border-border rounded-[20px] w-full max-w-2xl h-[90vh] flex flex-col"
        style={{ background: 'var(--bg-gradient-jet)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-inherit rounded-t-[20px]">
          <div className="flex-1">
            <h2 className="h3 text-white-2">{message.name}</h2>
            <p className="text-sm text-muted-foreground">{message.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onCreateMail(message.email)}
              className="p-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
              title="Create new mail"
            >
              <Plus className="w-5 h-5" />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 rounded-lg bg-onyx text-destructive hover:bg-destructive/20 transition-colors"
              title="Delete conversation"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-onyx/50 rounded-lg transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages Thread */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Subject */}
          <div className="bg-onyx/30 rounded-lg p-4 mb-4">
            <p className="text-xs text-muted-foreground mb-1">Subject</p>
            <p className="text-foreground font-medium">{message.subject}</p>
          </div>

          {/* Messages */}
          {messages.map((msg, index) => (
            <div 
              key={msg.id || index}
              className={`flex ${msg.role === 'admin' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                  msg.role === 'admin'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-onyx/30 text-foreground'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                  {msg.message}
                </p>
                {msg.file_name && (
                  <div className="mt-2 pt-2 border-t border-current/20">
                    <p className="text-xs opacity-75">📎 {msg.file_name}</p>
                  </div>
                )}
                <p className={`text-xs mt-2 ${
                  msg.role === 'admin' ? 'opacity-75' : 'text-muted-foreground'
                }`}>
                  {formatDate(msg.created_at)}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="px-6 py-3 bg-red-500/10 border-t border-red-500/30 text-red-500 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="px-6 py-3 bg-green-500/10 border-t border-green-500/30 text-green-500 text-sm">
            {success}
          </div>
        )}

        {/* Reply Input */}
        <form onSubmit={handleSendReply} className="p-6 border-t border-border space-y-4">
          <div>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your reply..."
              maxLength="2000"
              rows="3"
              className="form-input resize-none w-full"
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {replyText.length}/2000 characters
            </p>
          </div>

          {/* File Attachment */}
          <div>
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
              className="hidden"
              id="thread-file-input"
              disabled={isSubmitting}
            />
            <label
              htmlFor="thread-file-input"
              className="flex items-center gap-2 p-3 border border-border rounded-lg cursor-pointer hover:bg-onyx/30 transition-colors"
            >
              <Paperclip className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-foreground flex-1">
                {attachmentName || 'Attach file (optional, max 5MB)'}
              </span>
            </label>
          </div>

          {/* Send Button */}
          <button
            type="submit"
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting || !replyText.trim()}
          >
            <Send className="w-4 h-4" />
            {isSubmitting ? 'Sending...' : 'Send Reply'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ThreadedChatView;
