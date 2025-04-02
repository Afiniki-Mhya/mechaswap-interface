import React from "react";
import { useWallet, WalletProvider } from "@txnlab/use-wallet-react";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import { Provider, useSelector } from "react-redux";
import { store, persistor, RootState } from "./store/store";
import { PersistGate } from "redux-persist/integration/react";
import Navbar from "./components/Navbar";
import { routes } from "./routes";
import { getProviderInit } from "./wallets";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styled from "styled-components";

const BackgroundLayer = styled.div`
  width: 100%;
  height: 100%;
  top: 0;
`;

interface AppContainerProps {
  children: React.ReactNode;
}
const AppContainer: React.FC<AppContainerProps> = ({ children }) => {
  const isDarkTheme = useSelector(
    (state: RootState) => state.theme.isDarkTheme
  );
  return (
    <div
      style={{
        color: isDarkTheme ? "#fff" : "#000",
        transition: "all 0.25s linear",
      }}
    >
      <BackgroundLayer
        className="background-layer"
        style={{
          background: "#AB47BC", // isDarkTheme ? "#161717" : "#FFFFFF",
        }}
      ></BackgroundLayer>
      <div
        className="content-layer"
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
        }}
      >
        {children}
      </div>
    </div>
  );
};

// Create a new component that uses the wallet hook
const WalletInitializer: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const walletProviders = useWallet();
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <WalletProvider manager={getProviderInit()}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <WalletInitializer>
            <AppContainer>
              <Router>
                {/*<Navbar />*/}
                <Routes>
                  {routes.map((el) => (
                    <Route key={el.path} path={el.path} Component={el.Component} />
                  ))}
                </Routes>
              </Router>
            </AppContainer>
          </WalletInitializer>
        </PersistGate>
      </Provider>
      <ToastContainer />
    </WalletProvider>
  );
};

export default App;
