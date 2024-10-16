import React from 'react';
import { SetupWizard } from './components/SetupWizard';
import { AccountManager } from './components/AccountManager';

const App: React.FC = () => {
  // Use state to determine whether to show the SetupWizard or AccountManager
  const [isSetupComplete, setIsSetupComplete] = React.useState(false);

  return <div>{isSetupComplete ? <AccountManager /> : <SetupWizard />}</div>;
};

export default App;
