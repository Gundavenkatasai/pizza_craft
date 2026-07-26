import React from 'react';
import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  buttonText?: string;
  buttonLink?: string;
  onButtonClick?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  buttonText,
  buttonLink,
  onButtonClick
}) => {
  return (
    <div className="text-center py-12">
      <Icon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">
        {title}
      </h2>
      <p className="text-gray-600 mb-6">
        {description}
      </p>
      
      {buttonLink && buttonText && (
        <Link
          to={buttonLink}
          className="inline-block bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
        >
          {buttonText}
        </Link>
      )}
      
      {!buttonLink && onButtonClick && buttonText && (
        <button
          onClick={onButtonClick}
          className="inline-block bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
        >
          {buttonText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
