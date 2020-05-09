import React from 'react';
import './App.css';
import Header from './components/Header'
import Blending from './components/Main';
import { MasksContextProvider } from './contexts/mlContext';
import { DataContextProvider } from './contexts/classContextMgm'
import { SelectedContextProvider } from './contexts/selectContextMgmt';
function App() {
  return (
    <div>
      <Header />
      <DataContextProvider>
        <MasksContextProvider>
          <SelectedContextProvider>
            <Blending />
          </SelectedContextProvider>
        </MasksContextProvider>
      </DataContextProvider>
      <br></br>
    </div>
  );
}

export default App;
