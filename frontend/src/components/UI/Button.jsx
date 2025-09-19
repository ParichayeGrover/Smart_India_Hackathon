// src/components/common/Button.jsx
import React from 'react';

const Button = ({ children, onClick, className = '', type = 'button' }) => {
    return (
        <button
            type={type}
            onClick={onClick}
            className={`
        px-8 py-3 font-semibold rounded-md text-white
        bg-accent hover:bg-amber-600 focus:outline-none 
        focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-accent
        transition-all duration-300 ease-in-out transform hover:scale-105
        ${className}
      `}
        >
            {children}
        </button>
    );
};

export default Button;