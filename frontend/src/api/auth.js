import axiosInstance from '../services/axiosInstance';

// Login Request
export const login = async (username, password) => {
  const response = await axiosInstance.post('/auth/login', { username, password });
  return response;
};

// Register Request
export const register = async (username, password, isDemoUser) => {
  const response = await axiosInstance.post('/auth/register', { username, password, isDemoUser });
  return response;
};

// Logout Request
export const logout = async () => {
  const response = await axiosInstance.get('/auth/logout');
  return response;
};

// Devolopment only - check user
export const checkUser = async () => {
  const response = await axiosInstance.get('/auth/user');
  return response;
};

export const uploadImage = async () => {
  const response = await axiosInstance.post('/auth/uploadImage');
  return response;
};

export const toggleDarkMode = async () => {
  const response = await axiosInstance.get('/auth/toggleDarkMode')
  return response
}

export const toggleTheme = async () => {
  const response = await axiosInstance.get('/auth/toggleTheme')
  return response
}