const API_BASE = '/api';

const getToken = () => localStorage.getItem('codebase_ai_token');

const getHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleUnauth = (status) => {
  if (status === 401) {
    localStorage.removeItem('codebase_ai_token');
    localStorage.removeItem('codebase_ai_username');
    localStorage.removeItem('codebase_ai_avatar');
    window.location.href = '/login';
  }
};

export const api = {
  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      handleUnauth(res.status);
      throw new Error(data.detail || data.message || JSON.stringify(data) || 'Login failed');
    }
    return data;
  },

  async register(email, username, password) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      handleUnauth(res.status);
      throw new Error(data.detail || data.message || JSON.stringify(data) || 'Registration failed');
    }
    return data;
  },

  async getProjects() {
    const res = await fetch(`${API_BASE}/projects`, {
      headers: getHeaders(),
    });
    if (res.status === 401) {
      handleUnauth(401);
      throw new Error('Unauthorized');
    }
    if (!res.ok) throw new Error('Failed to fetch projects');
    return res.json();
  },

  async getProjectFiles(projectId) {
    const res = await fetch(`${API_BASE}/projects/${projectId}/files`, {
      headers: getHeaders(),
    });
    if (res.status === 401) {
      handleUnauth(401);
      throw new Error('Unauthorized');
    }
    if (!res.ok) throw new Error('Failed to fetch files');
    const data = await res.json();
    return data.files || [];
  },

  async getProjectHistory(projectId) {
    const res = await fetch(`${API_BASE}/projects/${projectId}/history`, {
      headers: getHeaders(),
    });
    if (res.status === 401) {
      handleUnauth(401);
      throw new Error('Unauthorized');
    }
    if (!res.ok) throw new Error('Failed to fetch history');
    return res.json();
  },

  async uploadZip(projectName, file) {
    const formData = new FormData();
    formData.append('project_name', projectName);
    formData.append('file', file);
    
    const res = await fetch(`${API_BASE}/upload/zip`, {
      method: 'POST',
      headers: getHeaders(),
      body: formData,
    });
    const data = await res.json();
    if (res.status === 401) {
      handleUnauth(401);
      throw new Error('Unauthorized');
    }
    if (!res.ok) throw new Error(data.detail || 'Upload failed');
    return data;
  },

  async uploadGithub(projectName, githubUrl) {
    const formData = new FormData();
    formData.append('project_name', projectName);
    formData.append('github_url', githubUrl);
    
    const res = await fetch(`${API_BASE}/upload/github`, {
      method: 'POST',
      headers: getHeaders(),
      body: formData,
    });
    const data = await res.json();
    if (res.status === 401) {
      handleUnauth(401);
      throw new Error('Unauthorized');
    }
    if (!res.ok) throw new Error(data.detail || 'Upload failed');
    return data;
  },

  async query({ projectId, mode, question, errorMessage, numQuestions }) {
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
        ...getHeaders(),
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (res.status === 401) {
      handleUnauth(401);
      throw new Error('Unauthorized');
    }
    if (!res.ok) throw new Error(data.detail || 'Query failed');
    return data;
  },

  async queryStream({ projectId, mode, question, errorMessage, numQuestions }, onChunk, onDone, onError) {
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
    
    try {
      const res = await fetch(`${API_BASE}/query/stream`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...getHeaders(),
        },
        body: JSON.stringify(body),
      });

      if (res.status === 401) {
        handleUnauth(401);
        onError('Unauthorized');
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        onError(data.detail || 'Query failed');
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.error) {
                onError(data.error);
                return;
              }
              if (data.done) {
                onDone(data);
                return;
              }
              if (data.content) {
                onChunk(data.content);
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (err) {
      onError(err.message || 'Stream failed');
    }
  },

  async deleteProject(projectId) {
    const res = await fetch(`${API_BASE}/projects/${projectId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (res.status === 401) {
      handleUnauth(401);
      throw new Error('Unauthorized');
    }
    if (!res.ok) throw new Error('Delete failed');
    return true;
  },
};
