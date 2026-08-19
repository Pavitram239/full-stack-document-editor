import React from 'react';
import { FileText, Search, UserCheck, ChevronDown } from 'lucide-react';

export default function Navbar({ currentUser, users, onSwitchUser, searchQuery, setSearchQuery, onGoHome }) {
  return (
    <header className="app-navbar">
      <div className="navbar-brand" onClick={onGoHome} style={{ cursor: 'pointer' }}>
        <div className="logo-icon">
          <FileText size={24} className="text-blue-600" />
        </div>
        <div className="brand-text">
          <span className="brand-title">Ajaia Docs</span>
          <span className="brand-badge">Collab</span>
        </div>
      </div>

      <div className="navbar-search">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          placeholder="Search documents by title or content..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button className="clear-search" onClick={() => setSearchQuery('')}>×</button>
        )}
      </div>

      <div className="navbar-user-section">
        <span className="user-label">Logged in as:</span>
        <div className="user-select-wrapper">
          <UserCheck size={16} className="user-icon" />
          <select
            value={currentUser ? currentUser.username : 'alice'}
            onChange={(e) => onSwitchUser(e.target.value)}
            className="user-select"
          >
            {users.map((u) => (
              <option key={u.id} value={u.username}>
                {u.first_name || u.username} ({u.email})
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="dropdown-arrow" />
        </div>
      </div>
    </header>
  );
}
