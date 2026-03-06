import { useState, useEffect } from 'react';
import { apiGet } from '../../api/request';
import { API_CONTACT_LIST } from '../../api/endpoints';
import { Mail, Plus, Search } from 'lucide-react';
import ThreadedChatView from '../../components/admin/ThreadedChatView';
import CreateMailModal from '../../components/admin/CreateMailModal';

const MessagesInbox = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [threadOpen, setThreadOpen] = useState(false);
  const [createMailOpen, setCreateMailOpen] = useState(false);
  const [createMailEmail, setCreateMailEmail] = useState('');
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

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

  const handleOpenThread = (message) => {
    setSelectedMessage(message);
    setThreadOpen(true);
  };

  const handleCreateMail = (email = '') => {
    setCreateMailEmail(email);
    setCreateMailOpen(true);
  };

  const handleCreateMailSuccess = (newMessage) => {
    setCreateMailOpen(false);
    setCreateMailEmail('');
    // Add new message to the list
    setMessages(prev => [newMessage, ...prev]);
    // Open the new thread
    handleOpenThread(newMessage);
  };

  const handleThreadClose = () => {
    setThreadOpen(false);
    setSelectedMessage(null);
  };

  // Filter messages based on search term
  const filteredMessages = messages.filter(msg => 
    msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="h2 text-white-2">Messages Inbox</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {messages.filter(m => !m.is_read).length} unread messages
          </p>
        </div>
        <button
          onClick={() => handleCreateMail()}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>New Mail</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm">
          {error}
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search messages..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="form-input pl-10 w-full"
        />
      </div>

      {/* Messages List */}
      <div 
        className="bg-card border border-border rounded-[20px] overflow-hidden"
        style={{ background: 'var(--bg-gradient-jet)' }}
      >
        <div className="max-h-[600px] overflow-y-auto">
          {filteredMessages.length === 0 ? (
            <div className="p-8 text-center">
              <Mail className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? 'No messages match your search' : 'No messages yet'}
              </p>
            </div>
          ) : (
            filteredMessages.map((message) => (
              <div
                key={message.id}
                onClick={() => handleOpenThread(message)}
                className={`p-4 border-b border-border cursor-pointer transition-colors hover:bg-onyx/30 ${
                  !message.is_read ? 'bg-onyx/20' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Status Indicator */}
                  <div className={`mt-1.5 w-3 h-3 rounded-full flex-shrink-0 ${
                    message.is_read ? 'bg-muted' : 'bg-primary'
                  }`} />
                  
                  <div className="flex-1 min-w-0">
                    {/* Name and Date */}
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className={`text-sm truncate ${
                        message.is_read ? 'text-foreground' : 'text-foreground font-semibold'
                      }`}>
                        {message.name}
                      </h4>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(message.created_at)}
                      </span>
                    </div>
                    
                    {/* Email */}
                    <p className="text-xs text-muted-foreground truncate mb-1">{message.email}</p>
                    
                    {/* Subject */}
                    <p className={`text-sm truncate ${
                      message.is_read ? 'text-light-gray' : 'text-foreground font-medium'
                    }`}>
                      {message.subject}
                    </p>
                    
                    {/* Preview */}
                    <p className="text-xs text-muted-foreground truncate mt-1">
                      {message.message}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Threaded Chat Modal */}
      {threadOpen && selectedMessage && (
        <ThreadedChatView
          message={selectedMessage}
          onClose={handleThreadClose}
          onRefresh={fetchMessages}
          onCreateMail={handleCreateMail}
        />
      )}

      {/* Create Mail Modal */}
      {createMailOpen && (
        <CreateMailModal
          onClose={() => {
            setCreateMailOpen(false);
            setCreateMailEmail('');
          }}
          onSuccess={handleCreateMailSuccess}
          prefilledEmail={createMailEmail}
        />
      )}
    </div>
  );
};

export default MessagesInbox;
