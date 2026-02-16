import { Note } from './types';

export const APP_NAME = "ReActum";
export const TAG_LINE = "Read → Re-Act → Actum";

export const INITIAL_NOTES: Note[] = [
  {
    id: '1',
    bookTitle: 'Atomic Habits',
    author: 'James Clear',
    content: "You do not rise to the level of your goals. You fall to the level of your systems. The goal is not to read a book, the goal is to become a reader.",
    tags: ['Habits', 'Productivity', 'Identity'],
    createdAt: new Date().toISOString(),
    actions: [
      {
        id: 'a1',
        title: '2-Minute Rule Setup',
        description: 'Identify one habit you want to start and scale it down to just 2 minutes.',
        duration: 2,
        isCompleted: true,
        createdAt: new Date().toISOString(),
        sourceNoteId: '1'
      }
    ]
  },
  {
    id: '2',
    bookTitle: 'Deep Work',
    author: 'Cal Newport',
    content: "To produce at your peak level you need to work for extended periods with full concentration on a single task free from distraction.",
    tags: ['Focus', 'Productivity', 'Work'],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    actions: []
  },
  {
    id: '3',
    bookTitle: 'The Psychology of Money',
    author: 'Morgan Housel',
    content: "Spending money to show people how much money you have is the fastest way to have less money.",
    tags: ['Finance', 'Psychology', 'Ego'],
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    actions: []
  },
  {
    id: '4',
    bookTitle: 'Essays in Love',
    author: 'Alain de Botton',
    content: "We fall in love because we long to escape from ourselves with someone as ideal as we are corrupt.",
    tags: ['Philosophy', 'Love', 'Relationships'],
    createdAt: new Date(Date.now() - 200000000).toISOString(),
    actions: []
  }
];
