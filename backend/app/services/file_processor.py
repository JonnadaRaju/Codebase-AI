import os
import zipfile
import shutil
import tempfile
from pathlib import Path
from typing import List, Dict
import git
from app.config import settings

EXCLUDE_DIRS = {
    '.git', 'node_modules', '__pycache__', 'dist', 'build',
    'venv', '.venv', 'env', '.env', 'coverage', '.pytest_cache',
    'migrations', '.idea', '.vscode', 'target', 'out'
}

INCLUDE_EXTENSIONS = {
    '.py', '.js', '.ts', '.jsx', '.tsx', '.java', '.cpp', '.c',
    '.go', '.rb', '.php', '.cs', '.rs', '.swift', '.kt',
    '.html', '.css', '.scss', '.json', '.yaml', '.yml',
    '.md', '.sql', '.sh', '.env.example'
}


def is_valid_file(filepath: str) -> bool:
    parts = Path(filepath).parts
    if any(p in EXCLUDE_DIRS for p in parts):
        return False
    suffix = Path(filepath).suffix.lower()
    return suffix in INCLUDE_EXTENSIONS


def is_within_size_limit(filepath: str) -> bool:
    size_kb = os.path.getsize(filepath) / 1024
    return size_kb <= settings.MAX_FILE_SIZE_KB


def extract_files_from_zip(zip_path: str) -> List[Dict]:
    files = []
    extract_dir = tempfile.mkdtemp()

    with zipfile.ZipFile(zip_path, 'r') as z:
        z.extractall(extract_dir)

    for root, dirs, filenames in os.walk(extract_dir):
        # Remove excluded dirs in-place to prevent os.walk from going into them
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]

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

    shutil.rmtree(extract_dir, ignore_errors=True)
    return files


def extract_files_from_github(github_url: str) -> List[Dict]:
    clone_dir = tempfile.mkdtemp()
    files = []

    try:
        git.Repo.clone_from(github_url, clone_dir, depth=1)

        for root, dirs, filenames in os.walk(clone_dir):
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]

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

    return files