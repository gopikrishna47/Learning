import { useEffect, useState } from 'react';

export default function AnimatedSection({ children, className = '', delay = 0 }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsVisible(true), 20 + delay);
    return () => window.clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`animated-section ${isVisible ? 'is-visible' : ''} ${className}`.trim()}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
