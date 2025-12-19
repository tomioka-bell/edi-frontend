import axios from "axios";
import Cookies from "js-cookie";

const apiBaseClient = axios.create({    
  baseURL: import.meta.env.VITE_API_BASE_URL, 
});

apiBaseClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get("auth_token"); 

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

apiBaseClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response.status === 401) {
      Cookies.remove("auth_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiBaseClient;
