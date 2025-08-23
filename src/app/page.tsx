"use client"
import { Dashboard } from '@/components/dashboard';
import withAuth from '@/components/withAuth';

function Home() {
  return <Dashboard />;
}

export default withAuth(Home)