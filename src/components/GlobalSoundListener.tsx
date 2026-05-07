import { useEffect } from 'react';
import { playCameraClick } from '../utils/sound';

export function GlobalSoundListener() {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Trigger sound on any button or anchor tag click
      if (target.closest('button') || target.closest('a')) {
        playCameraClick();
      }
    };

    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  return null;
}
