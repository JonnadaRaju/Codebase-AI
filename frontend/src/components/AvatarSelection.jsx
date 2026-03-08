import React, { useState, useRef } from 'react';

const EMOJI_AVATARS = ['👨‍💻', '👩‍💻', '🧑‍💻', '👾'];
const ANIMAL_AVATARS = ['🦊', '🐺', '🦁', '🐯'];
const SPACE_AVATARS = ['🚀', '🤖', '👽', '🧠'];
const ALL_AVATARS = [...EMOJI_AVATARS, ...ANIMAL_AVATARS, ...SPACE_AVATARS];

const COLORS = [
  '#22c55e', // green
  '#3b82f6', // blue
  '#a855f7', // purple
  '#f97316', // orange
  '#ef4444', // red
  '#eab308', // yellow
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

  const getAvatarStyle = (avatar) => {
    if (avatar?.type === 'custom') return {};
    return { backgroundColor: selectedColor };
  };

  const getAvatarContent = (avatar) => {
    if (avatar?.type === 'emoji') return avatar.value;
    if (avatar?.type === 'custom') return null;
    if (avatar?.type === 'initials') return username?.charAt(0).toUpperCase();
    return null;
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome, {username}! 👋
          </h1>
          <p className="text-gray-400">Choose your avatar to get started</p>
        </div>
        
        {customImagePreview && (
          <div className="flex justify-center mb-6">
            <div 
              className="w-20 h-20 rounded-full border-4 border-[#22c55e] shadow-[0_0_20px_rgba(34,197,94,0.4)] overflow-hidden"
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
        
        <div className="bg-[#1a1a1a] rounded-2xl p-8 border border-[#2a2a2a]">
          <div className="grid grid-cols-4 gap-4 mb-6">
            {ALL_AVATARS.map((emoji, index) => (
              <button
                key={emoji}
                onClick={() => handleAvatarSelect(emoji)}
                className={`w-18 h-18 rounded-full flex items-center justify-center text-3xl transition-all duration-200 animate-pop-in ${
                  isSelected(emoji)
                    ? 'border-4 border-[#22c55e] shadow-[0_0_15px_rgba(34,197,94,0.5)] scale-105'
                    : 'border-2 border-transparent hover:border-[#22c55e] hover:scale-105'
                }`}
                style={{ 
                  backgroundColor: '#212121',
                  animationDelay: `${index * 30}ms`,
                }}
              >
                {emoji}
                {isSelected(emoji) && (
                  <span className="absolute bottom-0 right-0 w-5 h-5 bg-[#22c55e] rounded-full flex items-center justify-center text-white text-xs animate-bounce">
                    ✓
                  </span>
                )}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-[#333]" />
            <span className="text-gray-500 text-sm">OR</span>
            <div className="flex-1 h-px bg-[#333]" />
          </div>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-3 px-4 border-2 border-[#333] hover:border-[#22c55e] text-gray-300 font-medium rounded-lg transition-colors"
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
            <p className="text-sm text-gray-400 mb-3 text-center">Choose avatar color</p>
            <div className="flex justify-center gap-3">
              {COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full transition-transform ${
                    selectedColor === color ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-[#1a1a1a]' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-6 space-y-4">
          <button
            onClick={handleContinue}
            disabled={!selectedAvatar}
            className="w-full py-3 px-4 bg-[#22c55e] hover:bg-[#16a34a] text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed animate-slide-up"
          >
            Continue →
          </button>
          
          <button
            onClick={handleSkip}
            className="w-full text-gray-500 text-sm hover:text-gray-400 transition-colors"
          >
            Skip, use initials instead
          </button>
        </div>
      </div>
    </div>
  );
}
