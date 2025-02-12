import React, { useState, Suspense } from 'react';

// Lazy load tab components
const GameTab = React.lazy(() => import('./tabs/GameTab'));
const ImageTab = React.lazy(() => import('./tabs/ImageTab'));
const SoundTab = React.lazy(() => import('./tabs/SoundTab'));
const ImageAssetsTab = React.lazy(() => import('./tabs/ImageAssetsTab'));
const SoundAssetsTab = React.lazy(() => import('./tabs/SoundAssetsTab'));

const tabs = [
  { id: 'game', label: 'Game', component: GameTab },
  { id: 'image', label: 'Image', component: ImageTab },
  { id: 'sound', label: 'Sound', component: SoundTab },
  { id: 'image-assets', label: 'Image Assets', component: ImageAssetsTab },
  { id: 'sound-assets', label: 'Sound Assets', component: SoundAssetsTab }
];

const LoadingFallback = () => (
  <div className="flex-1 flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
  </div>
);

const TabPanel = () => {
  const [activeTab, setActiveTab] = useState(tabs[0].id);

  const ActiveTabComponent = tabs.find(tab => tab.id === activeTab)?.component || tabs[0].component;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="border-b" style={{ borderColor: 'var(--color-border)' }}>
        <nav className="-mb-px flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                tab
                ${activeTab === tab.id ? 'tab-active' : 'tab-inactive'}
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="flex-1 min-h-0">
        <Suspense fallback={<LoadingFallback />}>
          <ActiveTabComponent />
        </Suspense>
      </div>
    </div>
  );
};

export default TabPanel;
