import React from 'react';
import './Card.css';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'sm' | 'md' | 'lg';
}

/**
 * Card component using design tokens
 * 
 * Demonstrates:
 * - Component-level token usage
 * - Variant patterns
 * - Responsive padding with tokens
 */
export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  padding = 'md'
}) => {
  const baseClasses = 'card';
  const variantClasses = `card--${variant}`;
  const paddingClasses = `card--padding-${padding}`;
  
  const classes = [baseClasses, variantClasses, paddingClasses, className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes}>
      {children}
    </div>
  );
};

export default Card; 