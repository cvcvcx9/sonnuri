import { useEffect, useState } from 'react';
import { Button } from '@extension/ui';
import { useStorage } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';
import HighlightText from './components/HighlightText';

export default function App() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    console.log('content-ui loaded');
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.pageX, y: event.pageY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  const handleClick = () => {
    alert(`Mouse position: ${mousePosition.x}, ${mousePosition.y}`);
  };
  return (
    <div>
      <HighlightText />
    </div>
  );
}
