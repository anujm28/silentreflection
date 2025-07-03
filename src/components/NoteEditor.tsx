import React, { useState, useEffect } from 'react';
import styles from './NoteEditor.module.css';
import { encryptionAlgorithms } from '../utils/encryptionAlgorithmsImpl';

interface NoteEditorProps {
  onSave: (note: string) => void;
  isLoading?: boolean;
  onClose?: () => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ onSave, isLoading = false, onClose }) => {
  const [note, setNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (note.trim()) {
      onSave(note);
      setNote('');
    }
  };

  const handleClear = () => {
    setNote('');
  };

  return (
    <form onSubmit={handleSubmit} className={styles.editor}>
      <div className={styles.section}>
        <label htmlFor="note" className={styles.label}>
          Your Note
        </label>
        <textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Enter your note here..."
          className={styles.textarea}
          autoFocus
        />
      </div>
      <div className={styles.controls}>
        <button 
          type="submit"
          className={styles.saveButton}
          disabled={isLoading || !note.trim()}
        >
          {isLoading ? 'Saving...' : 'Save Note'}
        </button>
        <button 
          type="button"
          onClick={handleClear}
          className={styles.clearButton}
          disabled={isLoading || !note.trim()}
        >
          Clear
        </button>
      </div>
    </form>
  );
};

export default NoteEditor; 