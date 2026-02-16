export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  NOTES = 'NOTES',
  GRAPH = 'GRAPH',
  GROWTH = 'GROWTH'
}

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  isCompleted: boolean;
  createdAt: string;
  sourceNoteId: string;
}

export interface Note {
  id: string;
  bookTitle: string;
  content: string;
  author: string;
  tags: string[];
  createdAt: string;
  actions: ActionItem[];
}

export interface GraphNode {
  id: string;
  group: number; // 1 for book, 2 for tag, 3 for note
  label: string;
  val: number;
}

export interface GraphLink {
  source: string;
  target: string;
  value: number;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}
