export enum CallState {
  IDLE = 'IDLE',
  MODAL_OPEN = 'MODAL_OPEN',
  CONNECTING = 'CONNECTING',
  ACTIVE = 'ACTIVE',
  ENDED = 'ENDED'
}

export interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: () => void;
}
