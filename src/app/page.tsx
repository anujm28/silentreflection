'use client';

import React, { useState, useEffect } from 'react';
import NoteEditor from '../components/NoteEditor';
import NoteList from '../components/NoteList';
import styles from './page.module.css';
import { encryptionAlgorithms } from '../utils/encryptionAlgorithmsImpl';

interface Note {
  id: string;
  content: string;
  timestamp: string;
  report?: PerformanceReportEntry[];
}

interface PerformanceReportEntry {
  algorithm: string;
  encryptionTime: number;
  decryptionTime: number;
  latency: number;
  throughput: number;
  success: boolean;
  error?: string;
}

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Load notes from localStorage if available
    const savedNotes = localStorage.getItem('notes');
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes));
      } catch (error) {
        console.error('Failed to load notes from localStorage:', error);
      }
    }
  }, []);

  // Save notes to localStorage whenever they change
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('notes', JSON.stringify(notes));
    }
  }, [notes, isClient]);

  const handleSave = async (content: string) => {
    if (!content.trim()) return;
    
    setIsLoading(true);
    try {
      // Generate performance report for all algorithms
      const report: PerformanceReportEntry[] = [];
      for (const algorithm of encryptionAlgorithms) {
        let encryptionTime = 0;
        let decryptionTime = 0;
        let latency = 0;
        let throughput = 0;
        let success = true;
        let error: string | undefined;
        try {
          // Measure latency
          const latencyStart = performance.now();
          await fetch('/api/ping');
          latency = performance.now() - latencyStart;

          // Measure encryption
          const encryptStart = performance.now();
          const encryptedResult = await algorithm.encrypt(content);
          encryptionTime = performance.now() - encryptStart;

          // Measure decryption
          const decryptStart = performance.now();
          const decryptedText = await algorithm.decrypt(encryptedResult.encrypted, encryptedResult.key);
          decryptionTime = performance.now() - decryptStart;

          if (decryptedText !== content) {
            throw new Error('Decryption result does not match original data.');
          }

          // Throughput: bytes/ms (using encryption + decryption time)
          const bytes = new TextEncoder().encode(content).length;
          throughput = bytes / (encryptionTime + decryptionTime);
        } catch (e) {
          success = false;
          error = e instanceof Error ? e.message : String(e);
          encryptionTime = 0;
          decryptionTime = 0;
          latency = 0;
          throughput = 0;
        }
        report.push({
          algorithm: algorithm.name,
          encryptionTime,
          decryptionTime,
          latency,
          throughput,
          success,
          error,
        });
      }
      const newNote: Note = {
        id: crypto.randomUUID(),
        content,
        timestamp: new Date().toISOString(),
        report,
      };
      setNotes(prev => [newNote, ...prev]);
      setShowEditor(false);
    } catch (error) {
      console.error('Failed to save note:', error);
      alert('Failed to save note');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
  };

  if (!isClient) {
    return null;
  }

  return (
    <div className={styles.dashboardContent}>
      {/* Add Note Button */}
      <div className={styles.addNoteSection}>
        <button 
          onClick={() => setShowEditor(true)}
          className={styles.addNoteButton}
        >
          <span className={styles.addIcon}>+</span>
          Add New Note
        </button>
          </div>

      {/* Notes List */}
            <NoteList
              notes={notes}
              onDelete={handleDelete}
              isLoading={isLoading}
      />

      {/* Floating Note Editor Modal */}
      {showEditor && (
        <div className={styles.editorModalOverlay} onClick={() => setShowEditor(false)}>
          <div className={styles.editorModal} onClick={(e) => e.stopPropagation()}>
            <button 
              className={styles.closeButton}
              onClick={() => setShowEditor(false)}
            >
              ×
            </button>
            <NoteEditor
              onSave={handleSave}
              isLoading={isLoading}
              onClose={() => setShowEditor(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
