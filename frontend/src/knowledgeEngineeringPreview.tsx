import React from 'react';
import ReactDOM from 'react-dom/client';
import { KnowledgeEngineeringTryItYourselfWidget } from './components/lesson/AILearnSection';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <div className="min-h-screen bg-slate-950 p-8">
      <KnowledgeEngineeringTryItYourselfWidget />
    </div>
  </React.StrictMode>
);
