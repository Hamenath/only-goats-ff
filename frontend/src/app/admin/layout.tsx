// This layout only applies to admin/page.tsx (login) and admin/unauthorized
// Dashboard pages are in admin/(dashboard)/ and have their own layout
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
