import { LucideIcon } from 'lucide-react';

export interface SecurityStep {
  id: string;
  title: string;
  description: string;
  points: number;
  actionLabel: string;
  icon: LucideIcon;
  actionType:
    | 'document'
    | 'photo'
    | 'video'
    | 'phone'
    | 'email'
    | 'profile'
    | 'media-comparison';
}

export type SecurityStepStatus = 'available' | 'completed' | 'pending' | 'locked';
