import { LucideIcon } from 'lucide-react';

export interface MenuItemData {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  iconColorClass: string;
  iconBgClass: string;
  customIcon?: React.ReactNode;
}

export interface MenuSectionData {
  title?: string;
  items: MenuItemData[];
}
