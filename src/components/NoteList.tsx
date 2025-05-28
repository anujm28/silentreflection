import React from 'react';
import Button from './Button';
import styles from './NoteList.module.css';

interface Note {
  id: string;
  content: string;
  scheme: string;
  timestamp: string;
}

interface NoteListProps {
  notes: Note[];
  onDecrypt: (note: Note) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

const NoteList: React.FC<NoteListProps> = ({ notes, onDecrypt, onDelete, isLoading = false }) => {
  if (notes.length === 0) {
    return (
      <div className={styles.empty}>
        <div>
          <div className={styles.emptyIcon}>
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className={styles.emptyTitle}>No encrypted notes yet</p>
          <p className={styles.emptyText}>Create your first encrypted note above</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {notes.map((note) => (
        <div key={note.id} className={styles.note}>
          <div className={styles.header}>
            <div className={styles.meta}>
              <span className={styles.scheme}>{note.scheme}</span>
              <span className={styles.timestamp}>
                {new Date(note.timestamp).toLocaleString()}
              </span>
            </div>
            <Button
              onClick={() => onDelete(note.id)}
              variant="danger"
              className="text-sm"
              disabled={isLoading}
            >
              Delete
            </Button>
          </div>
          
          <div className={styles.content}>
            <p className={styles.contentText}>{note.content}</p>
          </div>
          
          <Button
            onClick={() => onDecrypt(note)}
            variant="secondary"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Decrypting...' : 'Decrypt Note'}
          </Button>
        </div>
      ))}
    </div>
  );
};

export default NoteList; 