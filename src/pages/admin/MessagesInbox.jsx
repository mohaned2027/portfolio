import { useState, useEffect } from 'react';
import { apiGet, apiPatch, apiDelete } from '../../api/request';
import { API_CONTACT_LIST, API_CONTACT_READ, API_CONTACT_DELETE } from '../../api/endpoints';
import { Mail, Clock, Check, Trash2, Eye, Reply } from 'lucide-react';
import ReplyModal from '../../components/admin/ReplyModal';

const MessagesInbox = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiGet(API_CONTACT_LIST);
      
      if (response.status === 200 && response.data) {
        setMessages(response.data.messages || []);
      } else if (response.status === 404) {
        setMessages([]);
      } else {
        setMessages(response.data?.messages || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Failed to load messages');
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleMarkAsRead = async (id) => {
    try {
      const response = await apiPatch(`${API_CONTACT_READ}/${id}`, {});
      
      if (response.status === 200 || response.success) {
        setMessages(prev => prev.map(m => 
          m.id === id ? { ...m, is_read: true } : m
        ));
        
        if (selectedMessage?.id === id) {
          setSelectedMessage({ ...selectedMessage, is_read: true });
        }
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    
    try {
      const response = await apiDelete(`${API_CONTACT_DELETE}/${id}`);
      
      if (response.status === 200 || response.success) {
        setMessages(prev => prev.filter(m => m.id !== id));
        if (selectedMessage?.id === id) {
          setSelectedMessage(null);
        }
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const openMessage = async (message) => {
    setSelectedMessage(message);
    if (!message.is_read) {
      await handleMarkAsRead(message.id);
    }
  };

  const handleReplySuccess = () => {
    setReplyModalOpen(false);
    setSelectedMessage(null);
    // Optionally refresh messages
    fetchMessages();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="h2 text-white-2">Messages Inbox</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {messages.filter(m => !m.is_read).length} unread messages
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Messages List */}
        <div 
          className="lg:col-span-2 bg-card border border-border rounded-[20px] overflow-hidden"
          style={{ background: 'var(--bg-gradient-jet)' }}
        >
          <div className="max-h-[600px] overflow-y-auto">
            {messages.length === 0 ? (
              <div className="p-8 text-center">
                <Mail className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No messages yet</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  onClick={() => openMessage(message)}
                  className={`p-4 border-b border-border cursor-pointer transition-colors ${
                    selectedMessage?.id === message.id 
                      ? 'bg-primary/10' 
                      : message.is_read 
                        ? 'hover:bg-onyx/50' 
                        : 'bg-onyx/30 hover:bg-onyx/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Status Indicator */}
                    <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${
                      message.is_read ? 'bg-muted' : 'bg-primary'
                    }`} />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className={`text-sm truncate ${
                          message.is_read ? 'text-foreground' : 'text-foreground font-semibold'
                        }`}>
                          {message.name}
                        </h4>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(message.created_at).split(',')[0]}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{message.email}</p>
                      <p className="text-sm text-light-gray truncate mt-1">{message.subject}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Message Detail */}
        <div 
          className="lg:col-span-3 bg-card border border-border rounded-[20px] p-6"
          style={{ background: 'var(--bg-gradient-jet)' }}
        >
          {selectedMessage ? (
            <div>
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="h3 text-white-2 mb-1">{selectedMessage.name}</h3>
                  <a 
                    href={`mailto:${selectedMessage.email}`}
                    className="text-primary text-sm hover:underline"
                  >
                    {selectedMessage.email}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDelete(selectedMessage.id)}
                    className="p-2 rounded-lg bg-onyx text-destructive hover:bg-destructive/20 transition-colors"
                    title="Delete message"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Subject */}
              <div className="mb-4">
                <p className="text-xs text-muted-foreground mb-1">Subject</p>
                <p className="text-foreground font-medium">{selectedMessage.subject}</p>
              </div>

              {/* Date */}
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-6">
                <Clock className="w-4 h-4" />
                <span>{formatDate(selectedMessage.created_at)}</span>
                {selectedMessage.is_read && (
                  <span className="flex items-center gap-1 text-green-500 ml-4">
                    <Check className="w-4 h-4" />
                    Read
                  </span>
                )}
              </div>

              {/* Message Content */}
              <div className="bg-onyx/30 rounded-xl p-6 mb-6">
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                  {selectedMessage.message}
                </p>
              </div>

              {/* Reply Button */}
              <button
                onClick={() => setReplyModalOpen(true)}
                className="form-btn"
              >
                <Reply className="w-5 h-5" />
                <span>Reply</span>
              </button>

              {/* Reply Modal */}
              {replyModalOpen && (
                <ReplyModal
                  message={selectedMessage}
                  onClose={() => setReplyModalOpen(false)}
                  onSuccess={handleReplySuccess}
                />
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <Eye className="w-12 h-12 mb-4" />
              <p>Select a message to view</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesInbox;
