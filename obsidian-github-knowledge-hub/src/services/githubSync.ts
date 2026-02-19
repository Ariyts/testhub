// GitHub Sync Service
// This service handles file-based synchronization with GitHub

import { useWorkspaceStore } from '@/stores/useWorkspaceStore';
import { useUIStore } from '@/stores/useUIStore';
import { Workspace, FolderItem } from '@/types';

interface GitHubFile {
  path: string;
  content: string;
  sha?: string;
}

// Convert data to file structure
export function dataToFiles(workspace: Workspace, store: ReturnType<typeof useWorkspaceStore.getState>): GitHubFile[] {
  const files: GitHubFile[] = [];
  const workspacePath = workspace.name.replace(/[^a-zA-Z0-9-_]/g, '_');

  // Process each block
  workspace.blocks.forEach((block) => {
    const blockPath = `${workspacePath}/${block.name.replace(/[^a-zA-Z0-9-_]/g, '_')}`;

    switch (block.type) {
      case 'folders': {
        const items = store.getFolderItemsByBlock(block.id);
        processfolderItemsToFiles(items, blockPath, files);
        break;
      }
      case 'cards': {
        const items = store.getCardItemsByBlock(block.id);
        files.push({
          path: `${blockPath}/cards.json`,
          content: JSON.stringify(items, null, 2),
        });
        break;
      }
      case 'links': {
        const items = store.getLinkItemsByBlock(block.id);
        files.push({
          path: `${blockPath}/links.json`,
          content: JSON.stringify(items, null, 2),
        });
        break;
      }
      case 'commands': {
        const items = store.getCommandItemsByBlock(block.id);
        files.push({
          path: `${blockPath}/commands.json`,
          content: JSON.stringify(items, null, 2),
        });
        break;
      }
    }
  });

  // Add workspace config
  files.push({
    path: `${workspacePath}/.knowledge-hub/config.json`,
    content: JSON.stringify({
      id: workspace.id,
      name: workspace.name,
      icon: workspace.icon,
      blocks: workspace.blocks.map((b) => ({
        id: b.id,
        type: b.type,
        name: b.name,
        icon: b.icon,
        color: b.color,
      })),
    }, null, 2),
  });

  return files;
}

// Process folder items (notes and folders) into markdown files
function processfolderItemsToFiles(
  items: FolderItem[],
  basePath: string,
  files: GitHubFile[],
  parentId: string | null = null,
  currentPath: string = ''
) {
  const currentItems = items.filter((i) => i.parentId === parentId);

  currentItems.forEach((item) => {
    if (item.type === 'folder') {
      // Create folder by adding items inside it
      const folderPath = currentPath ? `${currentPath}/${item.name}` : item.name;
      processfolderItemsToFiles(items, basePath, files, item.id, folderPath);
    } else {
      // Create markdown file
      const filePath = currentPath
        ? `${basePath}/${currentPath}/${item.name}.md`
        : `${basePath}/${item.name}.md`;

      // Add frontmatter
      const frontmatter = [
        '---',
        `id: ${item.id}`,
        `created: ${item.createdAt}`,
        `updated: ${item.updatedAt}`,
        item.tags.length > 0 ? `tags: [${item.tags.join(', ')}]` : null,
        '---',
        '',
      ].filter(Boolean).join('\n');

      files.push({
        path: filePath,
        content: frontmatter + (item.content || ''),
      });
    }
  });
}

// GitHub API wrapper
export class GitHubService {
  private token: string;
  private owner: string;
  private repo: string;
  private branch: string;

  constructor(token: string, repository: string, branch: string = 'main') {
    this.token = token;
    const [owner, repo] = repository.split('/');
    this.owner = owner;
    this.repo = repo;
    this.branch = branch;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`https://api.github.com${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getFile(path: string): Promise<{ content: string; sha: string } | null> {
    try {
      const data = await this.request(
        `/repos/${this.owner}/${this.repo}/contents/${path}?ref=${this.branch}`
      );
      return {
        content: atob(data.content),
        sha: data.sha,
      };
    } catch {
      return null;
    }
  }

  async createOrUpdateFile(path: string, content: string, sha?: string): Promise<void> {
    const message = sha ? `Update ${path}` : `Create ${path}`;
    
    await this.request(`/repos/${this.owner}/${this.repo}/contents/${path}`, {
      method: 'PUT',
      body: JSON.stringify({
        message,
        content: btoa(unescape(encodeURIComponent(content))),
        branch: this.branch,
        sha,
      }),
    });
  }

  async deleteFile(path: string, sha: string): Promise<void> {
    await this.request(`/repos/${this.owner}/${this.repo}/contents/${path}`, {
      method: 'DELETE',
      body: JSON.stringify({
        message: `Delete ${path}`,
        sha,
        branch: this.branch,
      }),
    });
  }

  async getTree(): Promise<{ path: string; sha: string; type: string }[]> {
    try {
      const branch = await this.request(
        `/repos/${this.owner}/${this.repo}/branches/${this.branch}`
      );
      const tree = await this.request(
        `/repos/${this.owner}/${this.repo}/git/trees/${branch.commit.sha}?recursive=1`
      );
      return tree.tree;
    } catch {
      return [];
    }
  }

  async commitMultipleFiles(files: { path: string; content: string }[]): Promise<void> {
    // Get current commit SHA
    const branch = await this.request(
      `/repos/${this.owner}/${this.repo}/branches/${this.branch}`
    );
    const baseTree = branch.commit.sha;

    // Create blobs for each file
    const blobs = await Promise.all(
      files.map(async (file) => {
        const blob = await this.request(
          `/repos/${this.owner}/${this.repo}/git/blobs`,
          {
            method: 'POST',
            body: JSON.stringify({
              content: file.content,
              encoding: 'utf-8',
            }),
          }
        );
        return {
          path: file.path,
          mode: '100644' as const,
          type: 'blob' as const,
          sha: blob.sha,
        };
      })
    );

    // Create tree
    const tree = await this.request(
      `/repos/${this.owner}/${this.repo}/git/trees`,
      {
        method: 'POST',
        body: JSON.stringify({
          base_tree: baseTree,
          tree: blobs,
        }),
      }
    );

    // Create commit
    const commit = await this.request(
      `/repos/${this.owner}/${this.repo}/git/commits`,
      {
        method: 'POST',
        body: JSON.stringify({
          message: `Update ${files.length} files`,
          tree: tree.sha,
          parents: [branch.commit.sha],
        }),
      }
    );

    // Update branch reference
    await this.request(
      `/repos/${this.owner}/${this.repo}/git/refs/heads/${this.branch}`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          sha: commit.sha,
        }),
      }
    );
  }
}

// Auto-sync manager with debounce
let syncTimeout: ReturnType<typeof setTimeout> | null = null;
let pendingSync = false;

export function triggerAutoSync() {
  const uiState = useUIStore.getState();
  const { syncConfig } = uiState;

  if (!syncConfig.autoSync || !syncConfig.token || !syncConfig.repository) {
    return;
  }

  pendingSync = true;
  uiState.setPendingChanges((uiState.pendingChanges || 0) + 1);

  if (syncTimeout) {
    clearTimeout(syncTimeout);
  }

  syncTimeout = setTimeout(async () => {
    if (!pendingSync) return;

    try {
      uiState.setSyncStatus('syncing');
      
      const workspaceState = useWorkspaceStore.getState();
      const github = new GitHubService(
        syncConfig.token,
        syncConfig.repository,
        syncConfig.branch
      );

      // Convert all workspaces to files
      const allFiles: GitHubFile[] = [];
      for (const workspace of workspaceState.workspaces) {
        const files = dataToFiles(workspace, workspaceState);
        allFiles.push(...files);
      }

      // Commit all files
      await github.commitMultipleFiles(allFiles);

      uiState.setSyncStatus('synced');
      uiState.setPendingChanges(0);
      pendingSync = false;
    } catch (error) {
      console.error('Sync failed:', error);
      uiState.setSyncStatus('error');
    }
  }, syncConfig.debounceMs || 2000);
}
