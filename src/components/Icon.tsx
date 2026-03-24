import React from 'react';
import { 
  Plus, 
  X, 
  Check, 
  Edit, 
  Trash2, 
  Eye, 
  Package, 
  ClipboardList, 
  Inbox,
  Search,
  AlertCircle
} from 'lucide-react';

type IconName = 'Plus' | 'X' | 'Check' | 'Edit' | 'Trash2' | 'Eye' | 'Package' | 'ClipboardList' | 'Inbox' | 'Search' | 'AlertCircle';

const iconMap: Record<IconName, React.ComponentType<any>> = {
  Plus,
  X,
  Check,
  Edit,
  Trash2,
  Eye,
  Package,
  ClipboardList,
  Inbox,
  Search,
  AlertCircle
};

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
  const IconComponent = iconMap[name];

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
