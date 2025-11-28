
import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';

const ProgressBar: React.FC = () => {
  const { isLoading } = useApp();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setVisible(true);
      setProgress(0);
      const interval = setInterval(() => {
        setProgress((old) => {
          if (old >= 90) return 90; // Stall at 90% until finished
          const diff = Math.random() * 10;
          return Math.min(old + diff, 90);
        });
      }, 200);
      return () => clearInterval(interval);
    } else {
      setProgress(100);
      const timeout = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 400); // Fade out delay
      return () => clearTimeout(timeout);
    }
  }, [isLoading]);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-1 z-[100]">
      <div 
        className="h-full bg-indigo-600 shadow-[0_0_10px_#4f46e5] transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default ProgressBar;
