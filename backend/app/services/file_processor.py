import os
import zipfile
import shutil
import tempfile
from pathlib import Path
from typing import List, Dict
import git
from app.config import settings

# ── Directories to ALWAYS skip ──────────────────────────────────────────────
EXCLUDE_DIRS = {
    # version control
    '.git', '.svn', '.hg',
    # JS/Node
    'node_modules', '.npm', '.yarn', 'bower_components',
    # Python
    '__pycache__', 'venv', '.venv', 'env',
    'site-packages', '.tox', '.mypy_cache', '.pytest_cache',
    # Build outputs
    'dist', 'build', 'out', 'output', 'target',
    '.next', '.nuxt', '.svelte-kit',
    'coverage', '.nyc_output',
    # IDE
    '.idea', '.vscode', '.vs',
    # Mobile
    'Pods', '.gradle', 'DerivedData',
    # Misc
    'logs', 'tmp', 'temp', '.cache',
}

# ── Individual filenames to ALWAYS skip ─────────────────────────────────────
EXCLUDE_FILES = {
    'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml',
    'poetry.lock', 'Pipfile.lock', 'composer.lock',
    'Cargo.lock', 'Gemfile.lock',
    'bundle.js', 'bundle.min.js',
    '.DS_Store', 'Thumbs.db', 'desktop.ini',
}

# ── Extensions to ALWAYS skip ───────────────────────────────────────────────
EXCLUDE_EXTENSIONS = {
    # images
    '.jpg', '.jpeg', '.png', '.gif', '.svg', '.ico',
    '.webp', '.bmp', '.tiff', '.psd', '.ai',
    # fonts
    '.woff', '.woff2', '.ttf', '.eot', '.otf',
    # media
    '.mp4', '.mp3', '.wav', '.avi', '.mov',
    # binaries
    '.exe', '.dll', '.so', '.dylib', '.bin',
    '.pyc', '.pyo', '.pyd', '.class', '.o', '.a',
    # archives
    '.zip', '.tar', '.gz', '.rar', '.7z',
    # documents
    '.pdf', '.doc', '.docx', '.xls', '.xlsx',
    # large data
    '.csv', '.parquet', '.db', '.sqlite',
    # source maps
    '.map',
}

# ── Extensions that ARE useful ──────────────────────────────────────────────
INCLUDE_EXTENSIONS = {
    '.py', '.go', '.java', '.rb', '.php', '.cs',
    '.cpp', '.c', '.h', '.rs', '.swift', '.kt',
    '.js', '.ts', '.jsx', '.tsx',
    '.html', '.css', '.scss', '.sass', '.less',
    '.json', '.yaml', '.yml', '.toml', '.ini',
    '.md', '.sql', '.graphql', '.proto',
    '.sh', '.bash', '.zsh', '.ps1',
    '.env.example',
}


def is_excluded_dir(path_parts) -> bool:
    for part in path_parts:
        if part in EXCLUDE_DIRS:
            return True
        if part.endswith('.egg-info') or part.endswith('.dist-info'):
            return True
    return False


def is_valid_file(filepath: str) -> bool:
    path = Path(filepath)
    if is_excluded_dir(path.parts):
        return False
    if path.name in EXCLUDE_FILES:
        return False
    suffix = path.suffix.lower()
    if suffix in EXCLUDE_EXTENSIONS:
        return False
    return suffix in INCLUDE_EXTENSIONS


def is_within_size_limit(filepath: str) -> bool:
    size_kb = os.path.getsize(filepath) / 1024
    return size_kb <= settings.MAX_FILE_SIZE_KB


def is_minified(content: str, filename: str) -> bool:
    """Skip minified JS/CSS — avg line > 500 chars = minified."""
    if not filename.endswith(('.js', '.css')):
        return False
    lines = content.split('\n')
    avg = len(content) / max(len(lines), 1)
    return avg > 500


def process_files(files: List[Dict]) -> List[Dict]:
    cleaned = []
    for f in files:
        content = f['content'].strip()
        if not content:
            continue
        if is_minified(content, f['filename']):
            continue
        f['filename'] = f['filename'].replace('\\', '/')
        cleaned.append(f)
    return cleaned


def extract_files_from_zip(zip_path: str) -> List[Dict]:
    files = []
    extract_dir = tempfile.mkdtemp()
    try:
        with zipfile.ZipFile(zip_path, 'r') as z:
            z.extractall(extract_dir)

        for root, dirs, filenames in os.walk(extract_dir):
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS
                       and not d.endswith('.egg-info')]
            for filename in filenames:
                full_path = os.path.join(root, filename)
                relative_path = os.path.relpath(full_path, extract_dir)
                if not is_valid_file(relative_path):
                    continue
                if not is_within_size_limit(full_path):
                    continue
                with open(full_path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read().strip()
                if content:
                    files.append({
                        "filename": relative_path.replace("\\", "/"),
                        "content": content,
                        "language": Path(filename).suffix.lstrip('.')
                    })
    finally:
        shutil.rmtree(extract_dir, ignore_errors=True)
    return process_files(files)


def extract_files_from_github(github_url: str) -> List[Dict]:
    clone_dir = tempfile.mkdtemp()
    files = []
    try:
        git.Repo.clone_from(github_url, clone_dir, depth=1)
        for root, dirs, filenames in os.walk(clone_dir):
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS
                       and not d.endswith('.egg-info')]
            for filename in filenames:
                full_path = os.path.join(root, filename)
                relative_path = os.path.relpath(full_path, clone_dir)
                if not is_valid_file(relative_path):
                    continue
                if not is_within_size_limit(full_path):
                    continue
                with open(full_path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read().strip()
                if content:
                    files.append({
                        "filename": relative_path.replace("\\", "/"),
                        "content": content,
                        "language": Path(filename).suffix.lstrip('.')
                    })
    finally:
        shutil.rmtree(clone_dir, ignore_errors=True)
    return process_files(files)