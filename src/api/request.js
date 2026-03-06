// API Request Wrapper with Mock Data Support
// Toggle this flag to switch between mock and real API
export const MOCK_MODE = true;

// Import mock data
import profileData from './mockData/profile.json';
import resumeData from './mockData/resume.json';
import portfolioData from './mockData/portfolio.json';
import blogData from './mockData/blog.json';
import messagesData from './mockData/messages.json';
import servicesData from './mockData/services.json';
import testimonialsData from './mockData/testimonials.json';
import clientsData from './mockData/clients.json';

// Mock data mapping
const mockDataMap = {
  '/profile': profileData,
  '/resume': resumeData,
  '/portfolio': portfolioData,
  '/blog': blogData,
  '/messages': messagesData,
  '/services': servicesData,
  '/testimonials': testimonialsData,
  '/clients': clientsData,
};

// Simulated network delay (300-800ms)
const simulateDelay = () => new Promise(resolve => 
  setTimeout(resolve, Math.random() * 500 + 300)
);

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

// Set auth token in localStorage
export const setAuthToken = (token) => {
  localStorage.setItem('auth_token', token);
};

// Remove auth token from localStorage
export const removeAuthToken = () => {
  localStorage.removeItem('auth_token');
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!getAuthToken();
};

/**
 * Main API Fetch Wrapper
 * @param {string} endpoint - API endpoint (e.g., '/profile', '/resume')
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE, PATCH)
 * @param {object|FormData} body - Request body
 * @returns {Promise} - Response data
 */
export const apiFetch = async (endpoint, method = 'GET', body = null) => {
  // Mock Mode Logic
  if (MOCK_MODE) {
    await simulateDelay();
    
    // Handle authentication
    if (endpoint.includes('/auth/login')) {
      const credentials = body;
      // Mock login validation
      if (credentials?.email === 'admin@example.com' && credentials?.password === 'password') {
        const mockToken = 'mock_jwt_token_' + Date.now();
        setAuthToken(mockToken);
        return {
          success: true,
          token: mockToken,
          user: {
            id: 1,
            name: 'Richard Hanrick',
            email: 'admin@example.com',
            role: 'admin'
          }
        };
      } else {
        throw new Error('Invalid credentials');
      }
    }

    if (endpoint.includes('/auth/logout')) {
      removeAuthToken();
      return { success: true };
    }

    // Handle GET requests
    if (method === 'GET') {
      // Handle Contact Us List
      if (endpoint.includes('/admin/contact-us')) {
        return {
          status: 200,
          message: 'Messages retrieved successfully',
          data: {
            messages: [
              {
                id: 1,
                contact_id: 1,
                name: 'John Doe',
                email: 'john@example.com',
                subject: 'Project Inquiry',
                role: 'user',
                message: 'I am interested in your services for my project.',
                is_read: false,
                created_at: new Date(Date.now() - 86400000).toISOString(),
                updated_at: null
              },
              {
                id: 2,
                contact_id: 2,
                name: 'Jane Smith',
                email: 'jane@example.com',
                subject: 'Collaboration',
                role: 'user',
                message: 'Would you be interested in collaborating on a new venture?',
                is_read: true,
                created_at: new Date(Date.now() - 172800000).toISOString(),
                updated_at: null
              }
            ]
          }
        };
      }
      
      // Find matching mock data
      for (const [path, data] of Object.entries(mockDataMap)) {
        if (endpoint.includes(path)) {
          return { success: true, data };
        }
      }
      throw new Error('Endpoint not found');
    }

    // Handle POST/PUT requests (Create/Update)
    if (method === 'POST' || method === 'PUT') {
      console.log(`[Mock API] ${method} to ${endpoint}:`, body);
      
      // Handle Contact Us Store
      if (endpoint.includes('/contact-us/store')) {
        return {
          status: 200,
          message: 'Message sent successfully',
          data: {
            id: Math.floor(Math.random() * 1000),
            contact_id: Math.floor(Math.random() * 100),
            name: body.name,
            email: body.email,
            subject: body.subject,
            role: 'user',
            message: body.message,
            is_read: false,
            created_at: new Date().toISOString(),
            updated_at: null
          }
        };
      }
      
      // Handle Contact Us Reply
      if (endpoint.includes('/contact-us/reply')) {
        const msg = body instanceof FormData ? body.get('message') : body.message;
        return {
          status: 200,
          message: 'Reply sent successfully',
          data: {
            id: Math.floor(Math.random() * 1000),
            contact_id: Math.floor(Math.random() * 100),
            name: 'Admin',
            email: 'admin@example.com',
            subject: 'Re: Your Message',
            role: 'admin',
            message: msg,
            file_path: null,
            file_name: null,
            created_at: new Date().toISOString(),
            updated_at: null
          }
        };
      }
      
      // Handle Create Mail (new conversation)
      if (endpoint.includes('/contact-us/create')) {
        return {
          status: 200,
          message: 'Mail created successfully',
          data: {
            id: Math.floor(Math.random() * 1000),
            contact_id: Math.floor(Math.random() * 100),
            name: 'Admin',
            email: body.email || 'admin@example.com',
            subject: body.subject || 'New Message',
            role: 'admin',
            message: body.message || '',
            file_path: null,
            file_name: null,
            created_at: new Date().toISOString(),
            updated_at: null
          }
        };
      }
      
      return { 
        success: true, 
        message: 'Operation completed successfully',
        data: body 
      };
    }

    // Handle PATCH requests
    if (method === 'PATCH') {
      console.log(`[Mock API] PATCH ${endpoint}:`, body);
      
      // Handle Mark as Read
      if (endpoint.includes('/contact-us/read/')) {
        return {
          status: 200,
          message: 'Message marked as read',
          data: {
            id: Math.floor(Math.random() * 1000),
            contact_id: Math.floor(Math.random() * 100),
            name: 'John Doe',
            email: 'john@example.com',
            subject: 'Project Inquiry',
            role: 'user',
            message: 'I am interested in your services.',
            is_read: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        };
      }
      
      return {
        status: 200,
        message: 'Operation completed successfully',
        data: body
      };
    }

    // Handle DELETE requests
    if (method === 'DELETE') {
      console.log(`[Mock API] DELETE ${endpoint}`);
      return { success: true, message: 'Item deleted successfully' };
    }

    throw new Error('Unknown request method');
  }

  // Real API Mode
  const headers = {
    'Accept': 'application/json',
  };

  // Add auth token if available
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Don't set Content-Type for FormData (browser will set it with boundary)
  if (body && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const config = {
    method,
    headers,
  };

  if (body) {
    config.body = body instanceof FormData ? body : JSON.stringify(body);
  }

  try {
    const response = await fetch(endpoint, config);
    
    // Handle unauthorized response
    if (response.status === 401) {
      removeAuthToken();
      window.location.href = '/admin/login';
      throw new Error('Session expired. Please login again.');
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Convenience methods
export const apiGet = (endpoint) => apiFetch(endpoint, 'GET');
export const apiPost = (endpoint, body) => apiFetch(endpoint, 'POST', body);
export const apiPut = (endpoint, body) => apiFetch(endpoint, 'PUT', body);
export const apiDelete = (endpoint) => apiFetch(endpoint, 'DELETE');
export const apiPatch = (endpoint, body) => apiFetch(endpoint, 'PATCH', body);

// File upload helper
export const apiUpload = async (endpoint, file, fieldName = 'file') => {
  const formData = new FormData();
  formData.append(fieldName, file);
  return apiFetch(endpoint, 'POST', formData);
};

// Multipart form data helper for Contact Us Reply
export const apiMultipart = async (endpoint, data) => {
  const formData = new FormData();
  for (const [key, value] of Object.entries(data)) {
    if (value !== null && value !== undefined) {
      formData.append(key, value);
    }
  }
  return apiFetch(endpoint, 'POST', formData);
};
