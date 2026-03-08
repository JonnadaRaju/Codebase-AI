import React from 'react';
import { Bell, Settings, X } from 'lucide-react';
import { MODES } from '../constants';

export function TopNavbar({ 
  activeMode, 
  onModeChange, 
  username, 
  userAvatar,
  onLogout,
  onChangeAvatar,
  onOpenProjects 
}) {
  const [showDropdown, setShowDropdown] = React.useState(false);

  const userData = JSON.parse(localStorage.getItem('codebase_ai_user')) || {}
  const displayName = userData.full_name
    || userData.name
    || userData.username
    || username
    || 'Developer'
  
  const firstName = displayName.split(' ')[0]

  const getAvatarContent = () => {
    if (!userAvatar) return firstName?.charAt(0).toUpperCase() || 'U';
    if (userAvatar.type === 'emoji') return userAvatar.value;
    if (userAvatar.type === 'custom') return null;
    if (userAvatar.type === 'initials') return userAvatar.value || firstName?.charAt(0).toUpperCase();
    return firstName?.charAt(0).toUpperCase();
  };

  const isImage = userAvatar?.type === 'custom';

  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* Left Section */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
          <span className="text-white text-sm">⚡</span>
        </div>
        <span className="font-semibold text-gray-900">Codebase</span>
        <span className="text-green-500 font-semibold">AI</span>
      </div>

      {/* Center Section - Mode Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenProjects}
          className="px-5 py-2 rounded-full text-sm font-medium text-gray-500 hover:bg-gray-100 transition-all duration-200"
        >
          My Projects
        </button>
        {MODES.map((mode) => (
          <button
            key={mode.id}
            onClick={() => onModeChange(mode.id)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              activeMode === mode.id
                ? 'bg-gray-900 text-white cursor-pointer'
                : 'text-gray-500 hover:bg-gray-100 cursor-pointer'
            }`}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        <button className="text-gray-400 hover:text-gray-600">
          <Bell className="w-5 h-5" />
        </button>
        <button className="text-gray-400 hover:text-gray-600">
          <Settings className="w-5 h-5" />
        </button>
        
        <div className="relative">
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden"
              style={{ backgroundColor: userAvatar?.color || '#22c55e' }}
            >
              {isImage ? (
                <img src={userAvatar.value} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-sm font-medium">{getAvatarContent()}</span>
              )}
            </div>
            <span className="text-sm font-medium text-gray-700">{firstName}</span>
          </div>
          
          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-50 py-2">
              <div className="px-4 py-2 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden"
                    style={{ backgroundColor: userAvatar?.color || '#22c55e' }}
                  >
                    {isImage ? (
                      <img src={userAvatar.value} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white text-sm font-medium">{getAvatarContent()}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{displayName}</div>
                    <div className="text-xs text-gray-500 truncate">{username}@codebase.ai</div>
                  </div>
                </div>
              </div>
... (rest of the file)
              <button
                onClick={() => {
                  setShowDropdown(false);
                  onChangeAvatar();
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <span>🎨</span>
                <span>Change Avatar</span>
              </button>
              <button
                onClick={() => {
                  setShowDropdown(false);
                  onLogout();
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <span>🚪</span>
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
