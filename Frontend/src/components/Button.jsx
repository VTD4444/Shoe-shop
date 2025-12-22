import React from 'react';

const Button = ({ children, onClick, type = 'button', className = '', isLoading = false }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isLoading}
      className={`w-full py-3 px-4 bg-accent text-white font-semibold text-sm uppercase tracking-wider 
      hover:bg-opacity-80 transition duration-300 disabled:bg-gray-400 ${className}`}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  );
};

export default Button;