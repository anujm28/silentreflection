import { v4 as uuidv4 } from 'uuid';

export interface EncryptionResult {
  encrypted: string;
  key: string;
}

export interface EncryptionAlgorithm {
  name: string;
  encrypt: (text: string) => Promise<EncryptionResult>;
  decrypt: (encrypted: string, key: string) => Promise<string>;
}

// Re-export from the implementation file
export * from './encryptionAlgorithmsImpl'; 