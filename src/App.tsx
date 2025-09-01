// Minimal App.tsx for debugging
import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={
          <div className="min-h-screen flex items-center justify-center">
            <h1 className="text-2xl font-bold">App Loading...</h1>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}