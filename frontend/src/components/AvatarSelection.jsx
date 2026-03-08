import React, { useState, useRef } from 'react';

const EMOJI_AVATARS = ['👨‍💻', '👩‍💻', '🧑‍💻', '👾'];
const ANIMAL_AVATARS = ['🦊', '🐺', '🦁', '🐯'];
const SPACE_AVATARS = ['🚀', '🤖', '👽', '🧠'];
const ALL_AVATARS = [...EMOJI_AVATARS, ...ANIMAL_AVATARS, ...SPACE_AVATARS];

const COLORS = [
  '#22c55e',
  '#3b82f6',
  '#a855f7',
  '#f97316',
  '#ef4444',
  '#eab308',
];

export function AvatarSelection({ username, onComplete }) {
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [customImage, setCustomImage] = useState(null);
  const [customImagePreview, setCustomImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleAvatarSelect = (emoji) => {
    setSelectedAvatar({ type: 'emoji', value: emoji });
    setCustomImage(null);
    setCustomImagePreview(null);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target.result;
        setCustomImage(base64);
        setCustomImagePreview(base64);
        setSelectedAvatar({ type: 'custom', value: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleContinue = () => {
    const avatarData = {
      type: selectedAvatar?.type || 'initials',
      value: selectedAvatar?.value || null,
      color: selectedColor,
    };
    localStorage.setItem('codebase_ai_avatar', JSON.stringify(avatarData));
    onComplete(avatarData);
  };

  const handleSkip = () => {
    const avatarData = {
      type: 'initials',
      value: username?.charAt(0).toUpperCase(),
      color: selectedColor,
    };
    localStorage.setItem('codebase_ai_avatar', JSON.stringify(avatarData));
    onComplete(avatarData);
  };

  const isSelected = (emoji) => 
    selectedAvatar?.type === 'emoji' && selectedAvatar?.value === emoji;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-50 border border-green-200 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
            👋
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {username}!
          </h1>
          <p className="text-gray-500">Choose your avatar to get started</p>
        </div>
        
        {customImagePreview && (
          <div className="flex justify-center mb-6">
            <div 
              className="w-20 h-20 rounded-full border-4 border-green-500 shadow-lg overflow-hidden"
              style={{ backgroundColor: selectedColor }}
            >
              <img 
                src={customImagePreview} 
                alt="Custom avatar" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}
        
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg">
          <div className="grid grid-cols-4 gap-4 mb-6">
            {ALL_AVATARS.map((emoji, index) => (
              <button
                key={emoji}
                onClick={() => handleAvatarSelect(emoji)}
                className={`relative w-16 h-16 rounded-full flex items-center justify-center text-3xl transition-all duration-200 ${
                  isSelected(emoji)
                    ? 'border-4 border-green-500 shadow-lg scale-105'
                    : 'border-2 border-gray-100 hover:border-green-300 hover:scale-105 bg-gray-50'
                }`}
                style={{ 
                  animationDelay: `${index * 30}ms`,
                }}
              >
                {emoji}
                {isSelected(emoji) && (
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">
                    ✓
                  </span>
                )}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-gray-400 text-sm">OR</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-3 px-4 border-2 border-gray-200 hover:border-green-300 hover:bg-green-50 text-gray-600 font-medium rounded-xl transition-all"
          >
            Upload your own photo
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <div className="mt-6">
            <p className="text-sm text-gray-500 mb-3 text-center">Choose avatar color</p>
            <div className="flex justify-center gap-3">
              {COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full transition-transform ${
                    selectedColor === color ? 'scale-110 ring-2 ring-gray-400 ring-offset-2' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-6 space-y-3">
          <button
            onClick={handleContinue}
            disabled={!selectedAvatar}
            className="w-full py-3 px-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue →
          </button>
          
          <button
            onClick={handleSkip}
            className="w-full text-gray-500 text-sm hover:text-gray-600 transition-colors"
          >
            Skip, use initials instead
          </button>
        </div>
      </div>
    </div>
  );
}
