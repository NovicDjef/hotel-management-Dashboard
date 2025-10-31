'use client';

import AuthGuard from '../components/AuthGuard';

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard>{children}</AuthGuard>;
}
