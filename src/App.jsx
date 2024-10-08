import React, { useState } from "react"; // Add useState import
import { Route, Routes, Navigate } from "react-router-dom"; 
import Header from "./components/custom/Header.jsx";
import Hero from "./components/custom/Hero.jsx";
import { useDarkMode } from "./context/DarkModeContext.jsx";
import CreateProposal from "./create-proposal/create-proposal.jsx";
import ViewProposal from "./view-proposal/view-proposal.jsx";
import MyProposals from "./my-proposals/MyProposals.jsx";


function App() {
  const { darkMode } = useDarkMode()

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 text-black dark:text-white min-h-screen">
        <Header />

        <Routes>
          {/* Existing Routes */}
          <Route path="/" element={<Hero />} />
          <Route path="/create-proposal" element={<CreateProposal />} />
          <Route path="/my-proposal" element={<MyProposals />} />
          <Route path="/view-proposal/:docId" element={<ViewProposal />} />
          

        </Routes>
      </div>
    </div>
  );
}

export default App;
