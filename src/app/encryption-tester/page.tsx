import React, { useState } from 'react';
import { encryptionAlgorithms } from '@/utils/encryptionAlgorithmsImpl';
import { performanceTracker } from '@/utils/performanceMetrics';

export default function EncryptionTester() {
  const [selectedAlgo, setSelectedAlgo] = useState(encryptionAlgorithms[0]);
  const [input, setInput] = useState('');
  const [encrypted, setEncrypted] = useState('');
  const [decrypted, setDecrypted] = useState('');
  const [key, setKey] = useState('');
  const [metrics, setMetrics] = useState<any>(null);

  const handleEncrypt = async () => {
    const { result, metric } = await performanceTracker.measureOperation(
      'encrypt',
      selectedAlgo.name,
      input,
      () => selectedAlgo.encrypt(input)
    );
    setEncrypted(result.encrypted);
    setKey(result.key);
    setMetrics(metric);
  };

  const handleDecrypt = async () => {
    const { result, metric } = await performanceTracker.measureOperation(
      'decrypt',
      selectedAlgo.name,
      encrypted,
      () => selectedAlgo.decrypt(encrypted, key)
    );
    setDecrypted(result);
    setMetrics(metric);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>🔐 Encryption Benchmark Tool</h2>

      <label>Choose Algorithm:</label>
      <select onChange={e => setSelectedAlgo(encryptionAlgorithms[+e.target.value])}>
        {encryptionAlgorithms.map((algo, idx) => (
          <option value={idx} key={algo.name}>{algo.name}</option>
        ))}
      </select>

      <br /><br />
      <textarea rows={3} placeholder="Enter text..." value={input} onChange={e => setInput(e.target.value)} />

      <br /><br />
      <button onClick={handleEncrypt}>Encrypt</button>
      <button onClick={handleDecrypt}>Decrypt</button>

      <br /><br />
      {encrypted && <div><b>Encrypted:</b><pre>{encrypted}</pre></div>}
      {decrypted && <div><b>Decrypted:</b><pre>{decrypted}</pre></div>}
      
      {metrics && (
        <div>
          <h4>📊 Metrics</h4>
          <p>Encryption Time: {metrics.encryptionTime?.toFixed(2)} ms</p>
          <p>Decryption Time: {metrics.decryptionTime?.toFixed(2)} ms</p>
          <p>Latency: {metrics.latency?.toFixed(2)} ms</p>
        </div>
      )}
    </div>
  );
} 