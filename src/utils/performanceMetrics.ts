export interface PerformanceMetric {
  operation: 'encrypt' | 'decrypt';
  algorithm: string;
  encryptionTime: number;
  decryptionTime: number;
  latency: number;
  timestamp: number;
  success: boolean;
  error?: string;
}

class PerformanceTracker {
  private metrics: PerformanceMetric[] = [];
  private readonly MAX_METRICS = 1000;
  private listeners: Set<() => void> = new Set();

  public async measureOperation<T>(
    operation: 'encrypt' | 'decrypt',
    algorithm: string,
    input: string,
    operationFn: () => Promise<T>
  ): Promise<{ result: T; metric: PerformanceMetric }> {
    const startTime = performance.now();
    let success = true;
    let error: string | undefined;
    let result: T;
    let encryptionTime = 0;
    let decryptionTime = 0;
    let latency = 0;

    try {
      // Measure network latency
      const latencyStart = performance.now();
      try {
        await fetch('/api/ping');
        latency = performance.now() - latencyStart;
      } catch (e) {
        console.warn('Failed to measure latency:', e);
        latency = 0;
      }

      // Measure operation time
      const operationStart = performance.now();
      result = await operationFn();
      const operationTime = performance.now() - operationStart;

      // Set times based on operation type
      if (operation === 'encrypt') {
        encryptionTime = operationTime;
      } else {
        decryptionTime = operationTime;
      }

    } catch (e) {
      success = false;
      error = e instanceof Error ? e.message : 'Unknown error';
      throw e;
    } finally {
      const metric: PerformanceMetric = {
        operation,
        algorithm,
        encryptionTime,
        decryptionTime,
        latency,
        timestamp: Date.now(),
        success,
        error
      };
      this.addMetric(metric);
    }

    return { result, metric: this.metrics[this.metrics.length - 1] };
  }

  public addMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics.shift(); // Remove oldest metric
    }
    this.notifyListeners();
  }

  public getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  public getMetricsByAlgorithm(algorithm: string): PerformanceMetric[] {
    return this.metrics.filter(m => m.algorithm === algorithm);
  }

  public getMetricsByOperation(operation: 'encrypt' | 'decrypt'): PerformanceMetric[] {
    return this.metrics.filter(m => m.operation === operation);
  }

  public clearMetrics(): void {
    this.metrics = [];
    this.notifyListeners();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }
}

// Create a singleton instance
export const performanceTracker = new PerformanceTracker(); 