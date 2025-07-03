"use client";

import React, { useState, useEffect } from 'react';
import styles from './PerformanceReport.module.css';

export interface AlgorithmPerformanceMetric {
  algorithm: string;
  encryptionTime: number;
  decryptionTime: number;
  latency: number;
  timestamp: number;
  success: boolean;
  error?: string;
}

interface PerformanceReportProps {
  metrics: AlgorithmPerformanceMetric[];
  isOpen: boolean;
  onClose: () => void;
}

export const PerformanceReport: React.FC<PerformanceReportProps> = ({
  metrics,
  isOpen,
  onClose
}) => {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>('all');
  const [filteredMetrics, setFilteredMetrics] = useState<AlgorithmPerformanceMetric[]>([]);

  useEffect(() => {
    // Only show metrics for ECDH-AES, RSA-AES, and Kyber+ECDH-AES
    const allowed = ['ECDH-AES', 'RSA-AES', 'Kyber+ECDH-AES'];
    let filtered = metrics.filter(m => allowed.includes(m.algorithm));
    if (selectedAlgorithm !== 'all') {
      filtered = filtered.filter(m => m.algorithm === selectedAlgorithm);
    }
    setFilteredMetrics(filtered);
  }, [metrics, selectedAlgorithm]);

  const algorithms = ['all', ...new Set(metrics.map(m => m.algorithm))];

  const formatTime = (ms: number): string => {
    return `${ms.toFixed(2)}ms`;
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button onClick={onClose} className={styles.closeButton}>×</button>
        <h2 className={styles.header}>Performance Report</h2>
        <div className={styles.summary}>
          <div>
            <div>Total Runs: {filteredMetrics.length}</div>
          </div>
        </div>
        <div className={styles.details}>
          <div style={{width: '100%', overflowX: 'auto'}}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Algorithm</th>
                  <th>Encryption Time</th>
                  <th>Decryption Time</th>
                  <th>Latency</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredMetrics.length === 0 ? (
                  <tr>
                    <td colSpan={6} className={styles.noData}>
                      No performance data available
                    </td>
                  </tr>
                ) : (
                  filteredMetrics.map((metric, index) => (
                    <tr key={index} className={metric.success ? styles.success : styles.error}>
                      <td>{new Date(metric.timestamp).toLocaleTimeString()}</td>
                      <td>{metric.algorithm}</td>
                      <td>{formatTime(metric.encryptionTime)}</td>
                      <td>{formatTime(metric.decryptionTime)}</td>
                      <td>{formatTime(metric.latency)}</td>
                      <td>
                        {metric.success ? (
                          <span className={styles.success}>Success</span>
                        ) : (
                          <span className={styles.error} title={metric.error}>
                            Failed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}; 