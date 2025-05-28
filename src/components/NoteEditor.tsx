import React, { useState } from 'react';
import Button from './Button';
import styles from './NoteEditor.module.css';

interface NoteEditorProps {
  onEncrypt: (note: string, scheme: string) => void;
  onDecrypt: (note: string) => void;
  isLoading?: boolean;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ onEncrypt, onDecrypt, isLoading = false }) => {
  const [note, setNote] = useState('');
  const [scheme, setScheme] = useState('kyber-aes');

  const handleClear = () => {
    setNote('');
  };

  return (
    <div className={styles.editor}>
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
        />
      </div>
      
      <div className={styles.section}>
        <label htmlFor="scheme" className={styles.label}>
          Encryption Scheme
        </label>
        <select
          id="scheme"
          value={scheme}
          onChange={(e) => setScheme(e.target.value)}
          className={styles.select}
        >
          <option value="kyber-aes">Kyber + AES</option>
          <option value="rsa-aes">RSA + AES</option>
          <option value="ecdh-aes">ECDH + AES</option>
        </select>
      </div>

      <div className={styles.controls}>
        <Button 
          onClick={() => onEncrypt(note, scheme)}
          disabled={isLoading || !note.trim()}
        >
          {isLoading ? 'Encrypting...' : 'Encrypt & Save'}
        </Button>
        <Button 
          onClick={() => onDecrypt(note)}
          variant="secondary"
          disabled={isLoading || !note.trim()}
        >
          Decrypt Note
        </Button>
        <Button 
          onClick={handleClear}
          variant="danger"
          disabled={isLoading || !note.trim()}
        >
          Clear
        </Button>
      </div>
    </div>
  );
};

export default NoteEditor; 