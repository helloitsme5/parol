import { createReadStream } from 'fs';
import { createInterface } from 'readline';
import { createHash } from 'crypto';
import { URL } from 'url';
import { storage } from './storage';
import type { ProcessingJob } from '@shared/schema';

export class FileProcessor {
  private isProcessing = false;
  private currentJobId: string | null = null;

  async processFile(jobId: string, filePath: string): Promise<void> {
    if (this.isProcessing) {
      throw new Error('Another file is currently being processed');
    }

    this.isProcessing = true;
    this.currentJobId = jobId;

    try {
      await storage.updateProcessingJob(jobId, {
        status: 'processing',
        progress: 0,
      });

      const job = await storage.getProcessingJob(jobId);
      if (!job) {
        throw new Error('Job not found');
      }

      await this.streamProcessFile(job, filePath);

      await storage.updateProcessingJob(jobId, {
        status: 'completed',
        progress: 100,
        completedAt: new Date(),
      });

    } catch (error) {
      await storage.updateProcessingJob(jobId, {
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    } finally {
      this.isProcessing = false;
      this.currentJobId = null;
    }
  }

  private async streamProcessFile(job: ProcessingJob, filePath: string): Promise<void> {
    const fileStream = createReadStream(filePath);
    const rl = createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    let lineCount = 0;
    let processedCount = 0;
    let batchRecords: any[] = [];
    const batchSize = 1000;

    // First pass: count total lines for progress tracking
    const totalLines = await this.countLines(filePath);

    for await (const line of rl) {
      lineCount++;
      
      try {
        const record = this.parseLine(line, job.filename);
        if (record) {
          batchRecords.push(record);
          
          if (batchRecords.length >= batchSize) {
            await this.processBatch(batchRecords);
            processedCount += batchRecords.length;
            batchRecords = [];
            
            // Update progress
            const progress = Math.floor((lineCount / totalLines) * 100);
            await storage.updateProcessingJob(job.id, {
              progress,
              recordsProcessed: processedCount,
            });
          }
        }
      } catch (error) {
        console.warn(`Error processing line ${lineCount}: ${error}`);
        continue;
      }
    }

    // Process remaining batch
    if (batchRecords.length > 0) {
      await this.processBatch(batchRecords);
      processedCount += batchRecords.length;
    }

    await storage.updateProcessingJob(job.id, {
      recordsProcessed: processedCount,
    });
  }

  private async countLines(filePath: string): Promise<number> {
    const fileStream = createReadStream(filePath);
    const rl = createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    let count = 0;
    for await (const line of rl) {
      count++;
    }
    return count;
  }

  private parseLine(line: string, sourceFile: string): any | null {
    if (!line.trim()) return null;

    // Support both comma and semicolon separators
    const parts = line.includes(',') ? line.split(',') : line.split(';');
    
    if (parts.length !== 3) {
      throw new Error(`Invalid line format: expected 3 parts, got ${parts.length}`);
    }

    const [url, username, password] = parts.map(p => p.trim());
    
    if (!url || !username || !password) {
      throw new Error('Missing required fields');
    }

    // Parse URL to extract domain and subdomain
    const { domain, subdomain } = this.parseUrl(url);
    
    // Hash password for security
    const passwordHash = this.hashPassword(password);

    return {
      username,
      domain,
      subdomain,
      passwordHash,
      sourceFile,
    };
  }

  private parseUrl(urlString: string): { domain: string; subdomain?: string } {
    try {
      // Add protocol if missing
      if (!urlString.startsWith('http://') && !urlString.startsWith('https://')) {
        urlString = 'https://' + urlString;
      }

      const url = new URL(urlString);
      const hostname = url.hostname;
      const parts = hostname.split('.');

      if (parts.length <= 2) {
        return { domain: hostname };
      }

      // Extract domain and subdomain
      const domain = parts.slice(-2).join('.');
      const subdomain = parts.slice(0, -2).join('.');

      return { domain, subdomain: subdomain || undefined };
    } catch (error) {
      // Fallback: treat the whole string as domain
      return { domain: urlString };
    }
  }

  private hashPassword(password: string): string {
    return createHash('sha256').update(password).digest('hex');
  }

  private async processBatch(records: any[]): Promise<void> {
    const promises = records.map(record => storage.createBreachRecord(record));
    await Promise.allSettled(promises);
  }

  getProcessingStatus(): { isProcessing: boolean; currentJobId: string | null } {
    return {
      isProcessing: this.isProcessing,
      currentJobId: this.currentJobId,
    };
  }
}

export const fileProcessor = new FileProcessor();
