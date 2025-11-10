import { useState } from 'react';
import { RoutesTab, CompareTab, BankingTab, PoolingTab } from './adapters/ui/components';

type Tab = 'routes' | 'compare' | 'banking' | 'pooling';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('routes');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'routes':
        return <RoutesTab />;
      case 'compare':
        return <CompareTab />;
      case 'banking':
        return <BankingTab />;
      case 'pooling':
        return <PoolingTab />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Fuel EU Maritime Compliance Platform</h1>
        </div>
      </header>

      <nav className="bg-white shadow">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8">
            {(['routes', 'compare', 'banking', 'pooling'] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 border-b-2 font-medium text-sm capitalize transition-colors ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          {renderTabContent()}
        </div>
      </main>
    </div>
  );
}

export default App;
