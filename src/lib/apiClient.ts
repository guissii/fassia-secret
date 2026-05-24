import axios from 'axios';
import { API_URL } from './api';

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Send cookies with requests
});

export default apiClient;