import React, { useState } from 'react';
import styles from './NoteList.module.css';

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

interface NoteListProps {
  notes: Note[];
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export default function NoteList({ notes, onDelete, isLoading = false }: NoteListProps) {
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const [sidePanelNote, setSidePanelNote] = useState<Note | null>(null);

  const handleShowReport = (note: Note) => {
    setSidePanelNote(note);
    setSidePanelOpen(true);
  };

  const handleCloseSidePanel = () => {
    setSidePanelOpen(false);
    setSidePanelNote(null);
  };

  const formatTime = (ms: number): string => {
    return `${ms.toFixed(2)}ms`;
  };

  const getAlgorithmColor = (algorithm: string): string => {
    switch (algorithm) {
      case 'RSA-AES': return '#3b82f6';
      case 'RSA-4096-AES': return '#8b5cf6';
      case 'ECDH-AES': return '#10b981';
      default: return '#64748b';
    }
  };

  const calculateAverages = (report: PerformanceReportEntry[]) => {
    const successful = report.filter(r => r.success);
    if (successful.length === 0) return null;

    const avgEncrypt = successful.reduce((sum, r) => sum + r.encryptionTime, 0) / successful.length;
    const avgDecrypt = successful.reduce((sum, r) => sum + r.decryptionTime, 0) / successful.length;
    const avgLatency = successful.reduce((sum, r) => sum + r.latency, 0) / successful.length;
    const avgThroughput = successful.reduce((sum, r) => sum + r.throughput, 0) / successful.length;

    return { avgEncrypt, avgDecrypt, avgLatency, avgThroughput };
  };

  return (
    <div className={styles.noteList}>
      {notes.length === 0 ? (
        <p className={styles.emptyMessage}>No notes yet. Create one above!</p>
      ) : (
        <div className={styles.notesGrid}>
          {notes.map((note) => (
            <div key={note.id} className={styles.noteCard}>
              <div className={styles.noteContent}>
                <p className={styles.noteText}>{note.content}</p>
              </div>
              <div className={styles.noteFooter}>
                <span className={styles.timestamp}>
                  {new Date(note.timestamp).toLocaleString()}
                </span>
                <div className={styles.actions}>
                  {note.report && note.report.length > 0 && (
                  <button
                      onClick={() => handleShowReport(note)}
                    className={styles.performanceButton}
                    disabled={isLoading}
                  >
                      📊 Performance
                  </button>
                  )}
                  <button
                    onClick={() => onDelete(note.id)}
                    className={styles.deleteButton}
                    disabled={isLoading}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modern Performance Report Side Panel */}
      {sidePanelOpen && sidePanelNote && (
        <div className={styles.sidePanelOverlay} onClick={handleCloseSidePanel}>
          <div className={styles.sidePanel} onClick={e => e.stopPropagation()}>
            <button className={styles.sidePanelClose} onClick={handleCloseSidePanel}>
              ×
            </button>
            
            {/* Header */}
            <div className={styles.reportHeader}>
              <h2 className={styles.reportTitle}>Performance Report</h2>
              <p className={styles.reportSubtitle}>
                {new Date(sidePanelNote.timestamp).toLocaleString()}
              </p>
            </div>

            {/* Note Preview */}
            <div className={styles.notePreview}>
              <h3>Note Content</h3>
              <div className={styles.notePreviewContent}>
                {sidePanelNote.content}
              </div>
            </div>

            {/* Summary Cards */}
            {sidePanelNote.report && sidePanelNote.report.length > 0 && (
              <div className={styles.summaryCards}>
                {(() => {
                  const averages = calculateAverages(sidePanelNote.report);
                  if (!averages) return null;
                  
                  return (
                    <>
                      <div className={styles.summaryCard}>
                        <div className={styles.summaryIcon}>⚡</div>
                        <div className={styles.summaryContent}>
                          <span className={styles.summaryLabel}>Avg Encryption</span>
                          <span className={styles.summaryValue}>{formatTime(averages.avgEncrypt)}</span>
                        </div>
                      </div>
                      <div className={styles.summaryCard}>
                        <div className={styles.summaryIcon}>🔓</div>
                        <div className={styles.summaryContent}>
                          <span className={styles.summaryLabel}>Avg Decryption</span>
                          <span className={styles.summaryValue}>{formatTime(averages.avgDecrypt)}</span>
                        </div>
                      </div>
                      <div className={styles.summaryCard}>
                        <div className={styles.summaryIcon}>🌐</div>
                        <div className={styles.summaryContent}>
                          <span className={styles.summaryLabel}>Avg Latency</span>
                          <span className={styles.summaryValue}>{formatTime(averages.avgLatency)}</span>
                        </div>
                      </div>
                      <div className={styles.summaryCard}>
                        <div className={styles.summaryIcon}>📈</div>
                        <div className={styles.summaryContent}>
                          <span className={styles.summaryLabel}>Avg Throughput</span>
                          <span className={styles.summaryValue}>{formatTime(averages.avgThroughput)}</span>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            {/* Detailed Results */}
            <div className={styles.detailedResults}>
              <h3>Algorithm Performance</h3>
              <div className={styles.resultsGrid}>
                {sidePanelNote.report && sidePanelNote.report.length > 0 ? (
                  sidePanelNote.report.map((entry, idx) => (
                    <div 
                      key={idx} 
                      className={`${styles.resultCard} ${entry.success ? styles.successCard : styles.errorCard}`}
                    >
                      <div className={styles.resultHeader}>
                        <div 
                          className={styles.algorithmBadge}
                          style={{ backgroundColor: getAlgorithmColor(entry.algorithm) }}
                        >
                          {entry.algorithm}
                        </div>
                        <div className={styles.statusIndicator}>
                          {entry.success ? '✅' : '❌'}
                        </div>
                      </div>
                      
                      {entry.success ? (
                        <div className={styles.resultMetrics}>
                          <div className={styles.metric}>
                            <span className={styles.metricLabel}>Encryption:</span>
                            <span className={styles.metricValue}>{formatTime(entry.encryptionTime)}</span>
                          </div>
                          <div className={styles.metric}>
                            <span className={styles.metricLabel}>Decryption:</span>
                            <span className={styles.metricValue}>{formatTime(entry.decryptionTime)}</span>
                          </div>
                          <div className={styles.metric}>
                            <span className={styles.metricLabel}>Latency:</span>
                            <span className={styles.metricValue}>{formatTime(entry.latency)}</span>
                          </div>
                          <div className={styles.metric}>
                            <span className={styles.metricLabel}>Throughput:</span>
                            <span className={styles.metricValue}>{formatTime(entry.throughput)}</span>
                          </div>
                        </div>
                      ) : (
                        <div className={styles.errorMessage}>
                          <span className={styles.errorText}>Failed: {entry.error}</span>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className={styles.noData}>
                    <div className={styles.noDataIcon}>📊</div>
                    <p>No performance data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 