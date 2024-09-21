import React, { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Button } from "@/components/ui/button"

function PWAUpdateNotification() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (offlineReady || needRefresh) {
      setShowNotification(true);
    }
  }, [offlineReady, needRefresh]);

  const close = () => {
    setShowNotification(false);
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  if (!showNotification) {
    return null;
  }

  return (
    <div className="fixed bottom-0 right-0 m-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <p className="mb-2 dark:text-white">
        {offlineReady
          ? 'App ready to work offline'
          : 'New content available, click on reload button to update.'}
      </p>
      {needRefresh && (
        <Button onClick={() => updateServiceWorker(true)} className="mr-2">
          Reload
        </Button>
      )}
      <Button onClick={close} variant="outline">
        Close
      </Button>
    </div>
  );
}

export default PWAUpdateNotification;