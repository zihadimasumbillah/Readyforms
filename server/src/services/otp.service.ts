import crypto from 'crypto';

interface OTPRecord {
  code: string;
  expiresAt: number;
}

export class OTPService {
  private static store = new Map<string, OTPRecord>();
  private static intervalId: NodeJS.Timeout | null = null;

  /**
   * Start periodic eviction sweep for expired OTPs
   */
  public static startCleanup(intervalMs = 300000): void {
    if (this.intervalId) return;
    this.intervalId = setInterval(() => {
      const now = Date.now();
      for (const [email, record] of this.store.entries()) {
        if (now > record.expiresAt) {
          this.store.delete(email);
        }
      }
    }, intervalMs);
  }

  /**
   * Stop periodic eviction sweep (for graceful process shutdown or unit testing)
   */
  public static stopCleanup(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Generate a CSPRNG 6-digit OTP code and store with TTL
   */
  public static setOTP(email: string, ttlMs = 600000): string {
    const normalizedEmail = email.toLowerCase().trim();
    const otpCode = crypto.randomInt(100000, 999999).toString();
    const expiresAt = Date.now() + ttlMs;

    this.store.set(normalizedEmail, { code: otpCode, expiresAt });
    return otpCode;
  }

  /**
   * Retrieve stored OTP record
   */
  public static getOTP(email: string): OTPRecord | undefined {
    const normalizedEmail = email.toLowerCase().trim();
    return this.store.get(normalizedEmail);
  }

  /**
   * Verify an OTP code using timing-safe buffer comparison
   */
  public static verifyOTP(email: string, suppliedOtp: string): boolean {
    const normalizedEmail = email.toLowerCase().trim();
    const record = this.store.get(normalizedEmail);

    if (!record) return false;
    if (Date.now() > record.expiresAt) {
      this.store.delete(normalizedEmail);
      return false;
    }

    const expectedBuf = Buffer.from(record.code);
    const suppliedBuf = Buffer.from(suppliedOtp.trim());

    if (expectedBuf.length !== suppliedBuf.length || !crypto.timingSafeEqual(expectedBuf, suppliedBuf)) {
      return false;
    }

    // Single-use token: consume OTP upon successful verification
    this.store.delete(normalizedEmail);
    return true;
  }

  /**
   * Delete an OTP record manually
   */
  public static deleteOTP(email: string): void {
    const normalizedEmail = email.toLowerCase().trim();
    this.store.delete(normalizedEmail);
  }
}

// Auto-start cleanup on module initialization
OTPService.startCleanup();
