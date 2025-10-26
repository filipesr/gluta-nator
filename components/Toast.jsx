'use client';

import { useEffect } from 'react';

export default function Toast({ message, onDismiss, duration = 2600 }) {
  useEffect(() => {
    if (!message || !onDismiss) return undefined;
    const timer = window.setTimeout(onDismiss, duration);
    return () => window.clearTimeout(timer);
  }, [message, onDismiss, duration]);

  if (!message) return null;

  return <div className="toast visible">{message}</div>;
}
