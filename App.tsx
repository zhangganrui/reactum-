import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, 
  LayoutDashboard, 
  Network, 
  TrendingUp, 
  Plus, 
  Search, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Menu, 
  X,
  Feather,
  Trash2
} from 'lucide-react';
import { Note, ActionItem, ViewState } from './types';
import { INITIAL_NOTES, APP_NAME, TAG_LINE } from './constants';
import { generateActionsFromNote } from './services/geminiService';
import KnowledgeGraph from './components/KnowledgeGraph';
import GrowthStats from './components/GrowthStats';

const MAX_FREE_NOTES = 2; // Free tier limit

const App: React.FC = () => {
  // State
  const [activeView, setActiveView] = useState<ViewState>(ViewState.DASHBOARD);
  const [notes, setNotes] = useState<Note[]>(INITIAL_NOTES);
  const [showAddNote, setShowAddNote] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loadingActionFor, setLoadingActionFor] = useState<string | null>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  
  // New Note Form State
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteBook, setNewNoteBook] = useState('');
  const [newNoteTags, setNewNoteTags] = useState('');

  // Derived Data
  const allActions = useMemo(() => notes.flatMap(n => n.actions), [notes]);
  const pendingActions = useMemo(() => allActions.filter(a => !a.isCompleted), [allActions]);
  
  // Handlers
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();

    // Check free tier limit
    if (notes.length >= MAX_FREE_NOTES) {
      setShowAddNote(false);
      setShowLimitModal(true);
      return;
    }
    const newNote: Note = {
      id: Date.now().toString(),
      content: newNoteContent,
      bookTitle: newNoteBook,
      author: 'Unknown', // Simplified for demo
      tags: newNoteTags.split(',').map(t => t.trim()).filter(t => t),
      createdAt: new Date().toISOString(),
      actions: []
    };
    setNotes([newNote, ...notes]);
    setNewNoteContent('');
    setNewNoteBook('');
    setNewNoteTags('');
    setShowAddNote(false);
  };

  const handleGenerateAction = async (note: Note) => {
    setLoadingActionFor(note.id);
    try {
      const generatedActions = await generateActionsFromNote(note.content, note.bookTitle);
      
      const newActionItems: ActionItem[] = generatedActions.map((ga, idx) => ({
        id: `${note.id}-action-${Date.now()}-${idx}`,
        ...ga,
        isCompleted: false,
        createdAt: new Date().toISOString(),
        sourceNoteId: note.id
      }));

      setNotes(prevNotes => prevNotes.map(n => {
        if (n.id === note.id) {
          return { ...n, actions: [...n.actions, ...newActionItems] };
        }
        return n;
      }));

    } catch (err) {
      console.error(err);
    } finally {
      setLoadingActionFor(null);
    }
  };

  const toggleActionComplete = (noteId: string, actionId: string) => {
    setNotes(prevNotes => prevNotes.map(n => {
      if (n.id === noteId) {
        return {
          ...n,
          actions: n.actions.map(a => a.id === actionId ? { ...a, isCompleted: !a.isCompleted } : a)
        };
      }
      return n;
    }));
  };

  const deleteNote = (id: string) => {
      setNotes(prev => prev.filter(n => n.id !== id));
  }

  // Render Components
  const Navigation = ({ mobile = false }) => {
    const navItems = [
      { id: ViewState.DASHBOARD, icon: LayoutDashboard, label: 'Inspiration' },
      { id: ViewState.NOTES, icon: BookOpen, label: 'My Notes' },
      { id: ViewState.GRAPH, icon: Network, label: 'Mind Map' },
      { id: ViewState.GROWTH, icon: TrendingUp, label: 'Growth' },
    ];

    return (
      <nav className={`${mobile ? 'flex flex-col space-y-2' : 'flex flex-col space-y-4'}`}>
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => {
              setActiveView(item.id);
              if (mobile) setIsMobileMenuOpen(false);
            }}
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              activeView === item.id 
                ? 'bg-stone-800 text-white shadow-lg' 
                : 'text-stone-500 hover:bg-stone-100'
            }`}
          >
            <item.icon size={20} strokeWidth={activeView === item.id ? 2.5 : 2} />
            <span className={`font-medium ${activeView === item.id ? 'font-sans' : 'font-sans'}`}>{item.label}</span>
          </button>
        ))}
      </nav>
    );
  };

  return (
    <div className="min-h-screen bg-paper flex overflow-hidden selection:bg-action/20">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-72 flex-col p-6 border-r border-stone-200 h-screen sticky top-0">
        <div className="flex items-center space-x-2 mb-10 px-2">
          <div className="bg-stone-900 text-white p-2 rounded-lg">
            <Feather size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold font-serif tracking-tight text-ink">{APP_NAME}</h1>
            <p className="text-[10px] text-stone-500 uppercase tracking-widest font-bold">InsightAction</p>
          </div>
        </div>
        
        <div className="flex-1">
          <Navigation />
        </div>

        <div className="p-4 bg-stone-100 rounded-xl border border-stone-200 mt-auto">
            <p className="text-xs text-stone-500 font-semibold mb-2 uppercase">Pro Tip</p>
            <p className="text-xs text-stone-600 italic font-serif">
              "Reading without reflecting is like eating without digesting."
            </p>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-paper/90 backdrop-blur-md border-b border-stone-200 z-50 flex items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <Feather size={20} className="text-ink" />
          <span className="font-serif font-bold text-lg text-ink">{APP_NAME}</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-stone-600">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-paper z-40 pt-20 px-6 md:hidden animate-in slide-in-from-top-10">
          <Navigation mobile />
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-y-auto scroll-smooth md:pt-0 pt-16 no-scrollbar">
        <div className="max-w-5xl mx-auto p-6 md:p-10">
          
          {/* Add Note Modal */}
          {showAddNote && (
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
              <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-stone-100">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-serif font-bold text-ink">Capture Insight</h2>
                  <button onClick={() => setShowAddNote(false)} className="text-stone-400 hover:text-stone-600">
                    <X size={20} />
                  </button>
                </div>
                <form onSubmit={handleAddNote} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Book Title</label>
                    <input 
                      required
                      value={newNoteBook}
                      onChange={(e) => setNewNoteBook(e.target.value)}
                      placeholder="e.g. Atomic Habits"
                      className="w-full p-3 rounded-lg bg-stone-50 border border-stone-200 focus:border-stone-800 focus:ring-0 transition outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Excerpt / Thought</label>
                    <textarea 
                      required
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      rows={4}
                      placeholder="Type the quote or insight here..."
                      className="w-full p-3 rounded-lg bg-stone-50 border border-stone-200 focus:border-stone-800 focus:ring-0 transition outline-none resize-none font-serif"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Tags (comma separated)</label>
                    <input 
                      value={newNoteTags}
                      onChange={(e) => setNewNoteTags(e.target.value)}
                      placeholder="Habits, Focus, Life..."
                      className="w-full p-3 rounded-lg bg-stone-50 border border-stone-200 focus:border-stone-800 focus:ring-0 transition outline-none"
                    />
                  </div>
                  <div className="pt-2">
                    <button type="submit" className="w-full bg-stone-900 text-white py-3 rounded-xl font-medium hover:bg-stone-800 transition flex items-center justify-center gap-2">
                      <CheckCircle2 size={18} />
                      Save Note
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Limit Modal */}
          {showLimitModal && (
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 border border-stone-100 text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles size={32} className="text-amber-600" />
                </div>
                <h2 className="text-2xl font-serif font-bold text-ink mb-2">Free Limit Reached</h2>
                <p className="text-stone-600 mb-6">
                  You've used all <span className="font-bold text-ink">{MAX_FREE_NOTES} free notes</span>.<br />
                  Upgrade to unlock unlimited notes and features.
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => setShowLimitModal(false)}
                    className="w-full bg-stone-900 text-white py-3 rounded-xl font-medium hover:bg-stone-800 transition"
                  >
                    Got it
                  </button>
                  <button
                    onClick={() => setShowLimitModal(false)}
                    className="w-full bg-stone-100 text-stone-600 py-3 rounded-xl font-medium hover:bg-stone-200 transition"
                  >
                    Maybe Later
                  </button>
                </div>
                <p className="text-xs text-stone-400 mt-4">
                  Delete existing notes to free up space
                </p>
              </div>
            </div>
          )}

          {/* Header Section */}
          <header className="flex justify-between items-end mb-10">
            <div>
               <p className="text-stone-500 text-sm uppercase tracking-wider font-medium mb-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
               <h2 className="text-3xl md:text-4xl font-serif font-bold text-ink">
                 {activeView === ViewState.DASHBOARD && "Hello, Reader."}
                 {activeView === ViewState.NOTES && "Your Collection"}
                 {activeView === ViewState.GRAPH && "Knowledge Map"}
                 {activeView === ViewState.GROWTH && "Growth Report"}
               </h2>
            </div>
            <button
              onClick={() => {
                if (notes.length >= MAX_FREE_NOTES) {
                  setShowLimitModal(true);
                } else {
                  setShowAddNote(true);
                }
              }}
              className="bg-stone-900 hover:bg-stone-800 text-white px-5 py-3 rounded-full shadow-lg shadow-stone-300 transition-all transform hover:scale-105 flex items-center gap-2"
            >
              <Plus size={20} />
              <span className="hidden md:inline font-medium">Add Note</span>
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">{notes.length}/{MAX_FREE_NOTES}</span>
            </button>
          </header>

          {/* DASHBOARD VIEW */}
          {activeView === ViewState.DASHBOARD && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Hero: Next Action */}
              {pendingActions.length > 0 ? (
                <div className="bg-gradient-to-br from-[#E3F2FD] to-white p-8 rounded-2xl border border-blue-100 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 text-blue-900">
                    <Sparkles size={100} />
                  </div>
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold uppercase rounded-full mb-4">
                    <Sparkles size={12} />
                    Suggested for today
                  </span>
                  <h3 className="text-2xl font-serif font-bold text-ink mb-2 relative z-10">{pendingActions[0].title}</h3>
                  <p className="text-stone-600 mb-6 max-w-2xl relative z-10 leading-relaxed">{pendingActions[0].description}</p>
                  
                  <div className="flex items-center gap-4 relative z-10">
                    <button 
                      onClick={() => toggleActionComplete(pendingActions[0].sourceNoteId, pendingActions[0].id)}
                      className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition flex items-center gap-2 shadow-md shadow-blue-200"
                    >
                      <CheckCircle2 size={18} />
                      Mark as Done
                    </button>
                    <div className="text-sm text-stone-500 font-medium">
                      ~ {pendingActions[0].duration} mins
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-stone-100 p-8 rounded-2xl border border-stone-200 text-center">
                  <h3 className="text-xl font-serif text-stone-600 mb-2">All caught up!</h3>
                  <p className="text-stone-500 text-sm">Generate new actions from your notes to keep moving forward.</p>
                </div>
              )}

              {/* Recent Notes Grid */}
              <div>
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-ink">Recent Inputs</h3>
                    <button onClick={() => setActiveView(ViewState.NOTES)} className="text-sm text-stone-500 hover:text-stone-900 flex items-center gap-1">
                      View All <ArrowRight size={14} />
                    </button>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {notes.slice(0, 2).map(note => (
                      <div key={note.id} className="bg-white p-6 rounded-xl border border-stone-200 hover:border-stone-300 transition shadow-sm">
                         <div className="flex justify-between items-start mb-3">
                           <span className="text-xs font-bold text-[#D4A373] uppercase tracking-wide">{note.bookTitle}</span>
                           <span className="text-xs text-stone-400">{new Date(note.createdAt).toLocaleDateString()}</span>
                         </div>
                         <p className="font-serif text-stone-700 line-clamp-3 mb-4 leading-relaxed">"{note.content}"</p>
                         <div className="flex items-center gap-2">
                           {note.tags.map(tag => (
                             <span key={tag} className="text-[10px] bg-stone-100 text-stone-500 px-2 py-1 rounded-md">#{tag}</span>
                           ))}
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
            </div>
          )}

          {/* NOTES VIEW */}
          {activeView === ViewState.NOTES && (
             <div className="grid grid-cols-1 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="relative">
                  <Search className="absolute left-4 top-3.5 text-stone-400" size={20} />
                  <input 
                    placeholder="Search your wisdom..." 
                    className="w-full pl-12 pr-4 py-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-100 outline-none"
                  />
               </div>

               {notes.map(note => (
                 <div key={note.id} className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                   <div className="p-6 md:p-8">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-sm font-bold text-[#D4A373] uppercase tracking-wider mb-1">{note.bookTitle}</h3>
                          <p className="text-xs text-stone-400 font-medium">By {note.author}</p>
                        </div>
                        <div className="flex space-x-2">
                             <button onClick={() => deleteNote(note.id)} className="p-2 text-stone-300 hover:text-red-400 transition">
                                <Trash2 size={16} />
                             </button>
                        </div>
                      </div>
                      
                      <blockquote className="text-lg md:text-xl font-serif text-stone-700 leading-relaxed border-l-4 border-[#D4A373]/30 pl-4 mb-6 italic">
                        "{note.content}"
                      </blockquote>

                      {/* Actions Area */}
                      <div className="bg-stone-50 rounded-xl p-5 border border-stone-100">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-bold text-stone-500 uppercase flex items-center gap-2">
                            <TrendingUp size={14} /> Action Items
                          </h4>
                          {loadingActionFor === note.id ? (
                             <span className="text-xs text-stone-500 animate-pulse">Consulting AI...</span>
                          ) : (
                             <button 
                               onClick={() => handleGenerateAction(note)}
                               className="text-xs bg-white border border-stone-200 hover:border-[#2E7D32] hover:text-[#2E7D32] text-stone-600 px-3 py-1.5 rounded-full transition flex items-center gap-1 font-medium"
                             >
                               <Sparkles size={12} />
                               Generate Actions
                             </button>
                          )}
                        </div>

                        {note.actions.length === 0 ? (
                          <div className="text-center py-4">
                             <p className="text-stone-400 text-xs italic">No actions generated yet. Tap the button to transform this insight.</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {note.actions.map(action => (
                              <div key={action.id} className={`group flex items-start gap-3 p-3 rounded-lg transition-colors ${action.isCompleted ? 'bg-green-50/50' : 'bg-white border border-stone-200 hover:border-stone-300'}`}>
                                <button 
                                  onClick={() => toggleActionComplete(note.id, action.id)}
                                  className={`mt-1 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${action.isCompleted ? 'bg-[#2E7D32] border-[#2E7D32]' : 'border-stone-300 hover:border-[#2E7D32]'}`}
                                >
                                  {action.isCompleted && <CheckCircle2 size={12} className="text-white" />}
                                </button>
                                <div>
                                  <h5 className={`text-sm font-bold mb-0.5 ${action.isCompleted ? 'text-stone-400 line-through decoration-stone-400' : 'text-ink'}`}>
                                    {action.title}
                                  </h5>
                                  <p className={`text-xs ${action.isCompleted ? 'text-stone-300' : 'text-stone-500'}`}>
                                    {action.description} <span className="text-stone-300 mx-1">•</span> {action.duration}m
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                   </div>
                 </div>
               ))}
             </div>
          )}

          {/* GRAPH VIEW */}
          {activeView === ViewState.GRAPH && (
             <div className="animate-in fade-in zoom-in duration-500">
               <div className="bg-white p-1 rounded-2xl border border-stone-200 shadow-sm">
                 <KnowledgeGraph notes={notes} />
               </div>
               <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-[#D4A373]/10 p-4 rounded-xl border border-[#D4A373]/20">
                    <h4 className="text-[#D4A373] font-bold text-sm mb-1">Books</h4>
                    <p className="text-xs text-stone-600">Central hubs of your knowledge.</p>
                  </div>
                  <div className="bg-[#A3B18A]/20 p-4 rounded-xl border border-[#A3B18A]/30">
                    <h4 className="text-[#588157] font-bold text-sm mb-1">Insights</h4>
                    <p className="text-xs text-stone-600">Individual notes and quotes.</p>
                  </div>
                  <div className="bg-stone-100 p-4 rounded-xl border border-stone-200">
                    <h4 className="text-stone-600 font-bold text-sm mb-1">Tags</h4>
                    <p className="text-xs text-stone-500">Thematic connections across books.</p>
                  </div>
               </div>
             </div>
          )}

          {/* GROWTH VIEW */}
          {activeView === ViewState.GROWTH && (
            <GrowthStats notes={notes} allActions={allActions} />
          )}

        </div>
      </main>
    </div>
  );
};

export default App;
