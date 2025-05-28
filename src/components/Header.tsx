import React from 'react';
import styles from './Header.module.css';

const Header: React.FC = () => {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Encrypted Notes</h1>
          <div className={styles.subtitle}>Secure • Private • Reliable</div>
        </div>
      </div>
    </header>
  );
};

export default Header; 