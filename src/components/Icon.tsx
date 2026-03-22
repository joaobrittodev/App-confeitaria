import React from 'react';
import * as LucideIcons from 'lucide-react';

type IconName = keyof typeof LucideIcons;

export interface IconProps {
  name: IconName;
  size?: number | string;
  color?: string;
  strokeWidth?: number;
  className?: string;
  onClick?: () => void;
  title?: string;
}

const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  color = 'currentColor',
  strokeWidth = 2,
  className = '',
  onClick,
  title,
}) => {
  const IconComponent = LucideIcons[name] as React.ComponentType<{
    size?: number | string;
    color?: string;
    strokeWidth?: number;
    className?: string;
    onClick?: () => void;
    title?: string;
  }>;

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in lucide-react`);
    return null;
  }

  return (
    <IconComponent
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      className={className}
      onClick={onClick}
      title={title}
    />
  );
};

export default Icon;
