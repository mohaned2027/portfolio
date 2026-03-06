import { useState } from 'react';
import { useProfile } from '../../context/DataContext';
import { apiPost } from '../../api/request';
import { API_CONTACT_STORE } from '../../api/endpoints';
import { Send } from 'lucide-react';

const ContactSection = () => {
  const profile = useProfile();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    
    // Check form validity
    const { name: n, email, subject, message } = newFormData;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsValid(
      n.trim() !== '' && 
      emailRegex.test(email) && 
      subject.trim() !== '' && 
      message.trim() !== ''
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;

    setIsSubmitting(true);
    setSuccessMessage('');
    setErrorMessage('');
    
    try {
      const response = await apiPost(API_CONTACT_STORE, formData);
      
      // Check response status
      if (response.status === 200 || response.success) {
        setSuccessMessage('Message sent successfully!');
        
        // Reset form
        setFormData({ name: '', email: '', subject: '', message: '' });
        setIsValid(false);
        
        // Clear success message after 5 seconds
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        setErrorMessage(response.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setErrorMessage(error.message || 'An error occurred while sending your message');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <article className="animate-fade-in">
      {/* Title */}
      <header>
        <h2 className="h2 article-title">Contact</h2>
      </header>

      {/* Map */}
      <section className="relative h-[250px] w-full rounded-2xl mb-8 border border-border overflow-hidden">
        <figure className="h-full">
          <iframe
            src={profile?.map_embed}
            width="100%"
            height="100%"
            loading="lazy"
            className="border-none grayscale invert"
            title="Location Map"
          />
        </figure>
      </section>

      {/* Contact Form */}
      <section className="mb-[10px]">
        <h3 className="h3 mb-5">Contact Form</h3>

        <form onSubmit={handleSubmit}>
          {/* Success Message */}
          {successMessage && (
            <div className="mb-[25px] p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-500 text-sm">
              {successMessage}
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-[25px] p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm">
              {errorMessage}
            </div>
          )}

          {/* Input Group */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[25px] mb-[25px]">
            <input 
              type="text" 
              name="name" 
              className="form-input" 
              placeholder="Full name" 
              required
              maxLength="100"
              value={formData.name}
              onChange={handleChange}
            />
            <input 
              type="email" 
              name="email" 
              className="form-input" 
              placeholder="Email address" 
              required
              maxLength="150"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          {/* Subject */}
          <input 
            type="text" 
            name="subject" 
            className="form-input mb-[25px]" 
            placeholder="Subject" 
            required
            maxLength="200"
            value={formData.subject}
            onChange={handleChange}
          />

          {/* Message */}
          <textarea 
            name="message" 
            className="form-input min-h-[100px] h-[120px] max-h-[200px] resize-y mb-[25px]" 
            placeholder="Your Message" 
            required
            maxLength="2000"
            value={formData.message}
            onChange={handleChange}
          />

          {/* Submit Button */}
          <button 
            type="submit" 
            className="form-btn"
            disabled={!isValid || isSubmitting}
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
          </button>
        </form>
      </section>
    </article>
  );
};

export default ContactSection;
