import axios from 'axios';

const erp = axios.create({
  baseURL: 'https://erp.theteam.net.au',
  withCredentials: true, // Important: includes session cookie
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add response interceptor for error handling
erp.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('ERPNext API Error:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('ERPNext Network Error:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('ERPNext Request Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export const login = async (email, password) => {
  try {
    const loginData = {
      usr: email,
      pwd: password,
      device: 'desktop',
      cmd: 'login'
    };

    console.log('Attempting login with data:', { ...loginData, pwd: '***' });

    // First clear any existing cookies
    document.cookie = 'sid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

    const res = await erp.post('/api/method/login', loginData, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      withCredentials: true
    });

    console.log('Login response:', res.data);

    // Check if we got a session cookie in the response
    const cookies = res.headers['set-cookie'];
    if (cookies && cookies.some(cookie => cookie.includes('sid='))) {
      console.log('Session cookie received in response');
    } else {
      console.warn('No session cookie in response');
    }

    if (res.data.message === 'Logged In') {
      return res.data;
    } else {
      throw new Error(`Login failed: ${JSON.stringify(res.data)}`);
    }
  } catch (err) {
    const errorDetails = {
      status: err.response?.status,
      statusText: err.response?.statusText,
      data: err.response?.data,
      headers: err.response?.headers,
      message: err.message,
      config: {
        url: err.config?.url,
        method: err.config?.method,
        headers: err.config?.headers
      }
    };
    console.error('Login failed with details:', errorDetails);
    throw new Error(`Login failed: ${JSON.stringify(errorDetails)}`);
  }
};

export const getFormData = async (doctype, name) => {
  try {
    const response = await erp.get(`/api/resource/${doctype}/${name}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching form data:', error.response?.data || error);
    throw error;
  }
};

export const getFormList = async (doctype) => {
  try {
    const response = await erp.get(`/api/resource/${doctype}`);
    return response.data;
  } catch (error) {
    console.error('Error listing forms:', error.response?.data || error);
    throw error;
  }
}; 