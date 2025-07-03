import React, { useState } from 'react';
import { encryptionAlgorithms } from '../utils/encryptionAlgorithms';
import { PerformanceReport, AlgorithmPerformanceMetric } from './PerformanceReport';
import styles from './PerformanceTest.module.css';

const PerformanceTest: React.FC = () => {
  const [metrics, setMetrics] = useState<AlgorithmPerformanceMetric[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const runPerformanceTest = async () => {
    setIsTesting(true);
    setMetrics([]); // Clear old metrics
    const testData = 'This is a test string for performance evaluation.'.repeat(10);
    const newMetrics: AlgorithmPerformanceMetric[] = [];

    for (const algorithm of encryptionAlgorithms) {
      let latency = 0;
      let encryptionTime = 0;
      let decryptionTime = 0;
      let success = true;
      let error: string | undefined;
      
      try {
        // Measure latency
        const latencyStart = performance.now();
        await fetch('/api/ping');
        latency = performance.now() - latencyStart;

        // Measure encryption
        const encryptStart = performance.now();
        const encryptedResult = await algorithm.encrypt(testData);
        encryptionTime = performance.now() - encryptStart;

        // Measure decryption
        const decryptStart = performance.now();
        const decryptedText = await algorithm.decrypt(encryptedResult.encrypted, encryptedResult.key);
        decryptionTime = performance.now() - decryptStart;

        if (decryptedText !== testData) {
            throw new Error("Decryption result does not match original data.");
        }
      } catch (e) {
        success = false;
        error = e instanceof Error ? e.message : String(e);
        // Ensure times are 0 on failure
        encryptionTime = 0;
        decryptionTime = 0;
      }
      
      newMetrics.push({
        algorithm: algorithm.name,
        encryptionTime,
        decryptionTime,
        latency,
        timestamp: Date.now(),
        success,
        error
      });
    }

    setMetrics(newMetrics);
    setIsTesting(false);
    setIsReportOpen(true);
  };

  return (
    <div className={styles.container}>
      <div className={styles.algorithmsInfo}>
        <h3>Available Encryption Algorithms</h3>
        <ul>
          <li><b>ECDH-AES</b>: Elliptic Curve Diffie-Hellman key exchange with AES-GCM encryption. Secure and browser-native.</li>
          <li><b>Kyber-AES</b>: Simulated post-quantum Kyber key exchange with AES-GCM. Fast, browser-compatible (not real Kyber).</li>
          <li><b>Kyber+ECDH-AES</b>: Hybrid of simulated Kyber and ECDH for enhanced security. Browser-compatible (not real Kyber).</li>
        </ul>
      </div>
      <button
        onClick={runPerformanceTest}
        disabled={isTesting}
        className={styles.testButton}
      >
        {isTesting ? 'Running Test...' : 'Run Performance Test'}
      </button>

      <PerformanceReport
        metrics={metrics}
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />
    </div>
  );
};

export default PerformanceTest; 