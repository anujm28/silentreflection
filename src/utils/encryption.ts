// Mock encryption functions
export const encryptNote = async (note: string, scheme: string): Promise<string> => {
  // Simulate encryption delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock encryption - in real app, this would use actual encryption
  const mockEncrypted = btoa(note);
  return mockEncrypted;
};

export const decryptNote = async (encryptedNote: string): Promise<string> => {
  // Simulate decryption delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock decryption - in real app, this would use actual decryption
  try {
    return atob(encryptedNote);
  } catch (error) {
    throw new Error('Invalid encrypted note format');
  }
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15);
}; 