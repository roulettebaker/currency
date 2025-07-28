import { BrowserRouter, HashRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Send from "./pages/Send";
import SendForm from "./pages/SendForm";
import Receive from "./pages/Receive";
import Swap from "./pages/Swap";
import BuySell from "./pages/BuySell";
import History from "./pages/History";
import DApps from "./pages/DApps";
import Markets from "./pages/Markets";
import CoinDetail from "./pages/CoinDetail";
import GasStation from "./pages/GasStation";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import WelcomeScreen from "./components/WelcomeScreen";
import { Toaster } from "./components/ui/toaster";
import { WalletProvider } from "./contexts/WalletContext";
import { BalanceProvider } from "./contexts/BalanceContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { DatabaseStatus } from "./components/DatabaseStatus";
import { useWallets } from "./hooks/useWallets";

function App() {
  const { isFirstTime, addWallet, hasWallets } = useWallets();

  const handleWalletCreated = (walletName: string) => {
    addWallet(walletName);
  };

  // Detect if running in Chrome Extension
  const isExtension = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;
  const Router = isExtension ? HashRouter : BrowserRouter;

  return (
    <ErrorBoundary>
      <WalletProvider>
        <BalanceProvider>
          <Router>
            <div className="dark chrome-extension-optimized">
              {!hasWallets && isFirstTime ? (
                <WelcomeScreen onWalletCreated={handleWalletCreated} />
              ) : (
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/send" element={<Send />} />
                  <Route path="/send/:coinId" element={<SendForm />} />
                  <Route path="/receive" element={<Receive />} />
                  <Route path="/swap" element={<Swap />} />
                  <Route path="/buy-sell" element={<BuySell />} />
                  <Route path="/history" element={<History />} />
                  <Route path="/dapps" element={<DApps />} />
                  <Route path="/markets" element={<Markets />} />
                  <Route path="/coin/:coinId" element={<CoinDetail />} />
                  <Route path="/gas-station" element={<GasStation />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              )}
              {/* <DatabaseStatus /> - Temporarily disabled to prevent fetch errors */}
              <Toaster />
            </div>
          </Router>
        </BalanceProvider>
      </WalletProvider>
    </ErrorBoundary>
  );
}

export default App;
