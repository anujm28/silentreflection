'use client';

import React, { useState } from 'react';
import Header from '../components/Header';
import NoteEditor from '../components/NoteEditor';
import NoteList from '../components/NoteList';
import { encryptNote, decryptNote, generateId } from '../utils/encryption';
import styles from './page.module.css';

interface Note {
  id: string;
  content: string;
  scheme: string;
  timestamp: string;
}

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleEncrypt = async (note: string, scheme: string) => {
    if (!note.trim()) return;
    
    setIsLoading(true);
    try {
      const encryptedContent = await encryptNote(note, scheme);
      const newNote: Note = {
        id: generateId(),
        content: encryptedContent,
        scheme,
        timestamp: new Date().toISOString(),
      };
      setNotes(prev => [newNote, ...prev]);
    } catch (error) {
      console.error('Encryption failed:', error);
      alert('Failed to encrypt note');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecrypt = async (note: Note) => {
    setIsLoading(true);
    try {
      const decryptedContent = await decryptNote(note.content);
      alert(`Decrypted content: ${decryptedContent}`);
    } catch (error) {
      console.error('Decryption failed:', error);
      alert('Failed to decrypt note');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
  };

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <div className={styles.content}>
          <div className={styles.header}>
            <h2 className={styles.title}>Create Encrypted Note</h2>
            <p className={styles.subtitle}>
              Choose your encryption scheme and write your secure note
            </p>
          </div>

          <NoteEditor
            onEncrypt={handleEncrypt}
            onDecrypt={() => {}}
            isLoading={isLoading}
          />

          <div className={styles.notesSection}>
            <div className={styles.notesHeader}>
              <h2 className={styles.notesTitle}>Your Encrypted Notes</h2>
              <span className={styles.notesCount}>
                {notes.length} {notes.length === 1 ? 'note' : 'notes'}
              </span>
            </div>
            <NoteList
              notes={notes}
              onDecrypt={handleDecrypt}
              onDelete={handleDelete}
              isLoading={isLoading}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
