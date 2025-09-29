import React from 'react';
import './Button.css';

interface ButtonProps {
  onClick: () => void;
  label: string;
  style?: React.CSSProperties;
}

const Button: React.FC<ButtonProps> = ({ onClick, label, style }) => {
  return (
    <button className="button" onClick={onClick} style={style}>
      {label}
    </button>
  );
};

export default Button;