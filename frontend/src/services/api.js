const API_BASE = '/api';

const getToken = () => localStorage.getItem('codebase_ai_token');

export const api = {
  async login(email, password) {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || data.message || JSON.stringify(data) || 'Login failed');
    return data;
  },

  async register(email, username, password) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || data.message || JSON.stringify(data) || 'Registration failed');
    return data;
  },

  async getProjects() {
    const token = getToken();
    const res = await fetch(`${API_BASE}/projects`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error('Failed to fetch projects');
    return res.json();
  },

  async getProjectFiles(projectId) {
    const token = getToken();
    const res = await fetch(`${API_BASE}/projects/${projectId}/files`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error('Failed to fetch files');
    const data = await res.json();
    return data.files || [];
  },

  async uploadZip(projectName, file) {
    const token = getToken();
    const formData = new FormData();
    formData.append('project_name', projectName);
    formData.append('file', file);
    
    const res = await fetch(`${API_BASE}/upload/zip`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Upload failed');
    return data;
  },

  async uploadGithub(projectName, githubUrl) {
    const token = getToken();
    const formData = new FormData();
    formData.append('project_name', projectName);
    formData.append('github_url', githubUrl);
    
    const res = await fetch(`${API_BASE}/upload/github`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Upload failed');
    return data;
  },

  async query({ projectId, mode, question, errorMessage, numQuestions }) {
    const token = getToken();
    const body = {
      project_id: projectId,
      mode,
      question,
    };
    
    if (mode === 'debug' && errorMessage) {
      body.error_message = errorMessage;
    }
    if (mode === 'interview') {
      body.num_questions = numQuestions || 5;
    }
    
    const res = await fetch(`${API_BASE}/query`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Query failed');
    return data;
  },

  async deleteProject(projectId) {
    const token = getToken();
    const res = await fetch(`${API_BASE}/projects/${projectId}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error('Delete failed');
    return true;
  },
};
