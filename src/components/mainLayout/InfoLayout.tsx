import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar';
import CompanyFooter from '../CompanyFooter';

const InfoLayout: React.FC = () => {
  return (
    <div className="min-h-screen text-white font-sans selection:bg-brand-saffron selection:text-white flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24">
        <Outlet />
      </main>
      <CompanyFooter />
    </div>
  );
};

export default InfoLayout;
