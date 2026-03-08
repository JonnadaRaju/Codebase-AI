import React from 'react';

export function Avatar({ avatar, size = 'md', showDropdown, onClick }) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-9 h-9 text-base',
    lg: 'w-20 h-20 text-3xl',
  };

  const getAvatarContent = () => {
    if (avatar?.type === 'emoji') return avatar.value;
    if (avatar?.type === 'custom') {
      return (
        <img 
          src={avatar.value} 
          alt="Avatar" 
          className="w-full h-full object-cover"
        />
      );
    }
    if (avatar?.type === 'initials' || !avatar) {
      return null;
    }
    return null;
  };

  const isImage = avatar?.type === 'custom';

  return (
    <div 
      onClick={onClick}
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center overflow-hidden cursor-pointer transition-all hover:ring-2 hover:ring-[#22c55e] hover:ring-offset-2 hover:ring-offset-[#0d0d0d]`}
      style={{ 
        backgroundColor: avatar?.color || '#22c55e',
      }}
    >
      {isImage ? (
        getAvatarContent()
      ) : avatar?.type === 'initials' ? (
        <span className="font-semibold text-white">
          {avatar?.value || ''}
        </span>
      ) : (
        <span className="leading-none">{getAvatarContent()}</span>
      )}
    </div>
  );
}
