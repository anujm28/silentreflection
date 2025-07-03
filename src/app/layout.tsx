import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import styles from './layout.module.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Secure Notes',
  description: 'A secure note-taking application with encryption',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className={`${inter.className} h-full ${styles.body}`}>
        <div className={styles.dashboardLayout}>
          {/* Sidebar */}
          <aside className={styles.sidebar}>
            <div className={styles.logo}>🔒 <span>SilentReflection</span></div>
            <nav className={styles.navLinks}>
              <a href="#" className={styles.navLinkActive}>Notes</a>
              <a href="#">Performance</a>
              <a href="#">Settings</a>
            </nav>
            <div className={styles.userSection}>
              <div className={styles.avatar}>SR</div>
              <div className={styles.username}>User</div>
            </div>
          </aside>
          {/* Main Area */}
          <div className={styles.mainArea}>
            {/* Topbar */}
            <header className={styles.topbar}>
              <div className={styles.topbarTitle}>Secure Notes Dashboard</div>
              <div className={styles.topbarUserMenu}>
                <span className={styles.avatarSmall}>SR</span>
                <span className={styles.usernameSmall}>User</span>
              </div>
            </header>
            {/* Main Content */}
            <main className={styles.mainContent}>{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
