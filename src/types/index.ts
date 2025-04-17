
export interface Bookmark {
  id: string;
  title: string;
  url: string;
  dateAdded: Date;
  favicon?: string;
  tags: string[];
  description?: string;
  screenshot?: string;
  likes: number;
  dislikes: number;
}

export interface Tag {
  id: string;
  name: string;
  count: number;
}

export type ViewMode = 'grid' | 'list';

export type SortOption = 'dateAdded' | 'title' | 'likes';
export type SortDirection = 'asc' | 'desc';

export interface FilterOptions {
  search: string;
  tags: string[];
  sortBy: SortOption;
  sortDirection: SortDirection;
}
