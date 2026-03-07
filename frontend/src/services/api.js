const API_BASE = '/api';

export const api = {
  async getProjects() {
    const res = await fetch(`${API_BASE}/projects`);
    if (!res.ok) throw new Error('Failed to fetch projects');
    return res.json();
  },

  async getProjectFiles(projectId) {
    const res = await fetch(`${API_BASE}/projects/${projectId}/files`);
    if (!res.ok) throw new Error('Failed to fetch files');
    const data = await res.json();
    return data.files || [];
  },

  async uploadZip(projectName, file) {
    const formData = new FormData();
    formData.append('project_name', projectName);
    formData.append('file', file);
    
    const res = await fetch(`${API_BASE}/upload/zip`, {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Upload failed');
    return data;
  },

  async uploadGithub(projectName, githubUrl) {
    const formData = new FormData();
    formData.append('project_name', projectName);
    formData.append('github_url', githubUrl);
    
    const res = await fetch(`${API_BASE}/upload/github`, {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Query failed');
    return data;
  },

  async deleteProject(projectId) {
    const res = await fetch(`${API_BASE}/projects/${projectId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Delete failed');
    return true;
  },
};
