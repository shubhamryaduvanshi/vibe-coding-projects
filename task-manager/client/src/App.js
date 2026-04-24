import React, { useState } from 'react';
import { KanbanProvider } from './context/KanbanContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Board from './components/Board';
import BoardSelector from './components/BoardSelector';
import AuthForm from './components/AuthForm';

function AppContent() {
  const [showBoardSelector, setShowBoardSelector] = useState(true);
  const { user, loading, isAuthenticated, logout } = useAuth();

  if (loading) {
    return (
      <div className="app-shell flex min-h-screen items-center justify-center">
        <div className="panel p-6">Checking session...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthForm />;
  }

  return (
    <KanbanProvider>
      <div className="app-shell">
        {/* Header */}
        <header className="bg-white shadow-lg border-b border-gray-200">
          <div className="page-container py-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary-500 rounded-xl shadow-md">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Kanban Board</h1>
                  <p className="text-gray-600 mt-1">Jira-like task management with drag & drop</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowBoardSelector(!showBoardSelector)}
                  className="btn-primary"
                >
                  {showBoardSelector ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                      Hide Boards
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
                      </svg>
                      Show Boards
                    </>
                  )}
                </button>
                
                <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>{user?.name}</span>
                </div>
                <button className="btn-secondary" onClick={logout}>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="page-container py-6 sm:py-8">
          {showBoardSelector && (
            <div className="mb-8 animate-fade-in">
              <div className="panel p-4 sm:p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                  </svg>
                  Select a Board
                </h2>
                <BoardSelector onBoardSelect={() => setShowBoardSelector(false)} />
              </div>
            </div>
          )}
          
          <div className={`transition-all duration-300 ${showBoardSelector ? 'opacity-70 scale-95' : 'opacity-100 scale-100'}`}>
            <div className="mb-6 rounded-2xl bg-gradient-to-r from-primary-50 to-transparent p-1">
              <div className="panel-soft p-3 sm:p-5">
                <Board />
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-12">
          <div className="page-container py-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="text-gray-700 font-medium">
                  Kanban Board &copy; {new Date().getFullYear()}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="px-2 py-1 bg-gray-100 rounded">MERN Stack</span>
                  <span className="px-2 py-1 bg-gray-100 rounded">React 19</span>
                  <span className="px-2 py-1 bg-gray-100 rounded">@dnd-kit</span>
                  <span className="px-2 py-1 bg-gray-100 rounded">Tailwind CSS</span>
                </div>
              </div>
              
              <div className="text-gray-500 text-sm">
                <p>Drag and drop tasks between columns to update their status</p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </KanbanProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
