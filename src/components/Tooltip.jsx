import { useState } from 'react';

export function Tooltip({ children, text, align = 'center' }) {
  const [visible, setVisible] = useState(false);

  if (!text) return children;

  return (
    <span
      className="tooltip-wrapper"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <span className={`tooltip tooltip-align-${align}`} role="tooltip">
          {text}
          <span className="tooltip-arrow" />
        </span>
      )}
    </span>
  );
}
