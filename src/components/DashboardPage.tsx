import React from 'react';
import { Outlet } from 'react-router-dom';
import DashboardLayout from '../dashboard/layout/DashboardLayout';

const Dashboard: React.FC = () => {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
};

export default Dashboard;