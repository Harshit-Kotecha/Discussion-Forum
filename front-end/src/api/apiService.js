import axios from "axios";

class ApiService {
  static instance = null; // Holds the single instance
  static baseURL = "http://localhost:3000/api";

  constructor() {
    if (!ApiService.baseURL) {
      throw new Error(
        "Base URL not set. Use ApiService.setBaseURL(url) to set it."
      );
    }
    if (ApiService.instance) {
      return ApiService.instance; // Return existing instance if already created
    }

    this.api = axios.create({
      baseURL: ApiService.baseURL,
    });

    ApiService.instance = this; // Set the singleton instance
  }

  // Static method to set the base URL
  static setBaseURL(url) {
    ApiService.baseURL = url;
  }

  // GET request
  async get(endpoint, params = {}) {
    try {
      const response = await this.api.get(endpoint, { params });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // POST request
  async post(endpoint, data = {}, config = {}) {
    try {
      const response = await this.api.post(endpoint, data, config);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // PUT request
  async put(endpoint, data = {}, config = {}) {
    try {
      const response = await this.api.put(endpoint, data, config);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // DELETE request
  async delete(endpoint, config = {}) {
    try {
      const response = await this.api.delete(endpoint, config);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Error handling
  handleError(error) {
    console.error("API call error:", error);
    throw error.response ? error.response.data : error.message;
  }
}

export default ApiService;
