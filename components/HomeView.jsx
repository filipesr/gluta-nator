'use client';

import { useCallback, useState } from 'react';

import { hasValidFirebaseConfig } from '@/lib/firebase';

import ConfigWarning from './ConfigWarning';
import CreateEventForm from './CreateEventForm';
import RecentEvents from './RecentEvents';
import Toast from './Toast';

export default function HomeView() {
  const [toastMessage, setToastMessage] = useState(null);
  const [lastCreated, setLastCreated] = useState(null);
  const configReady = hasValidFirebaseConfig();

  const showToast = useCallback((message) => {
    setToastMessage(message);
  }, []);

  const dismissToast = useCallback(() => {
    setToastMessage(null);
  }, []);

  return (
    <main>
      <div className="page">
        <header>
          <div>
            <h1>Gluta-nator</h1>
            <p>
              Monte competições amistosas de pedaços de pizza ou sushi com contadores individuais e
              ranking em tempo real.
            </p>
          </div>
        </header>

        {configReady ? (
          <>
            <CreateEventForm
              onToast={showToast}
              onCreated={(event) => setLastCreated(event.slug)}
            />
            <RecentEvents refreshKey={lastCreated} />
          </>
        ) : (
          <ConfigWarning />
        )}
      </div>

      <Toast message={toastMessage} onDismiss={dismissToast} />
    </main>
  );
}
