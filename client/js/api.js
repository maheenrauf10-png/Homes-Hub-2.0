/**
 * @fileoverview API Client module for HOMES HUB.
 * Handles all network requests to the backend API.
 * @module ApiClient
 */

/**
 * Base configuration for the API
 * @constant
 */
const API_CONFIG = {
  BASE_URL: '/api',
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json',
  },
};

/**
 * Custom Error class for API related errors
 * @class ApiError
 * @extends Error
 */
class ApiError extends Error {
  /**
   * @param {string} message - Error message
   * @param {number} [status] - HTTP status code
   * @param {Object} [data] - Additional error data
   */
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * API Client class handling all backend interactions
 */
class ApiClient {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  /**
   * Updates the authentication token
   * @param {string} token - JWT token
   */
  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  /**
   * Clears the authentication token
   */
  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  /**
   * Generic request handler with error handling and timeouts
   * @private
   * @param {string} endpoint - API endpoint (e.g., '/properties')
   * @param {Object} [options={}] - Fetch options
   * @returns {Promise<any>} Response data
   * @throws {ApiError}
   */
  async _request(endpoint, options = {}) {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    const headers = { ...API_CONFIG.HEADERS, ...options.headers };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(
          data.error || 'An unexpected error occurred',
          response.status,
          data
        );
      }

      return data;
    } catch (error) {
      console.error(`API Request failed for ${url}:`, error);
      if (error instanceof ApiError) throw error;
      throw new ApiError(error.message || 'Network error', 0);
    }
  }

  // ==================== AUTHENTICATION ====================

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @param {string} userData.name - Full name
   * @param {string} userData.email - Email address
   * @param {string} userData.password - Password
   * @param {string} userData.phone - Phone number
   * @returns {Promise<Object>} User and token data
   */
  async register(userData) {
    if (!userData.email || !userData.password) {
      throw new Error('Email and password are required');
    }
    const data = await this._request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (data.token) this.setToken(data.token);
    return data;
  }

  /**
   * Login a user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} User and token data
   */
  async login(email, password) {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    const data = await this._request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) this.setToken(data.token);
    return data;
  }

  // ==================== PROPERTIES ====================

  /**
   * Fetch all properties with optional filters
   * @param {Object} [filters={}] - Query filters
   * @returns {Promise<Array>} List of properties
   */
  async getProperties(filters = {}) {
    const queryString = new URLSearchParams(filters).toString();
    const endpoint = queryString ? `/properties?${queryString}` : '/properties';
    return this._request(endpoint);
  }

  /**
   * Fetch a single property by ID
   * @param {string} id - Property ID
   * @returns {Promise<Object>} Property details
   */
  async getPropertyById(id) {
    if (!id) throw new Error('Property ID is required');
    return this._request(`/properties/${id}`);
  }

  /**
   * Create a new property listing
   * @param {Object} propertyData - Property details
   * @returns {Promise<Object>} Created property
   */
  async createProperty(propertyData) {
    return this._request('/properties', {
      method: 'POST',
      body: JSON.stringify(propertyData),
    });
  }

  /**
   * Update an existing property
   * @param {string} id - Property ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated property
   */
  async updateProperty(id, updates) {
    return this._request(`/properties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Delete a property
   * @param {string} id - Property ID
   * @returns {Promise<Object>} Success message
   */
  async deleteProperty(id) {
    return this._request(`/properties/${id}`, {
      method: 'DELETE',
    });
  }
}

// Export a singleton instance
const api = new ApiClient();

// Expose to window for non-module scripts if needed
window.api = api;
