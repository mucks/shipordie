import { join } from 'path';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import bcrypt from 'bcryptjs';

// Ensure data directory exists
const dataDir = join(process.cwd(), 'data');
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

const waitlistPath = join(dataDir, 'waitlist.json');
const adminPath = join(dataDir, 'admin.json');

// Simple file-based storage
function readWaitlistFile(): WaitlistEntry[] {
  if (!existsSync(waitlistPath)) {
    return [];
  }
  try {
    const content = readFileSync(waitlistPath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return [];
  }
}

function writeWaitlistFile(entries: WaitlistEntry[]): void {
  writeFileSync(waitlistPath, JSON.stringify(entries, null, 2), 'utf-8');
}

function readAdminFile(): { username: string; passwordHash: string } | null {
  if (!existsSync(adminPath)) {
    // Create default admin
    const passwordHash = bcrypt.hashSync('admin123', 10);
    const admin = { username: 'admin', passwordHash };
    writeFileSync(adminPath, JSON.stringify(admin, null, 2), 'utf-8');
    console.log('✅ Default admin created: username=admin, password=admin123');
    return admin;
  }
  try {
    const content = readFileSync(adminPath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

export interface WaitlistEntry {
  id: number;
  name: string;
  email: string;
  wallet_address: string | null;
  role: string;
  features: string[] | null;
  will_pay: string;
  additional_info: string | null;
  created_at: string;
}

export interface AdminUser {
  id: number;
  username: string;
  password_hash: string;
  created_at: string;
}

export const waitlistDb = {
  // Waitlist operations
  insertWaitlistEntry: (entry: Omit<WaitlistEntry, 'id' | 'created_at'>) => {
    const entries = readWaitlistFile();
    const newId = entries.length > 0 ? Math.max(...entries.map(e => e.id)) + 1 : 1;
    const newEntry: WaitlistEntry = {
      id: newId,
      ...entry,
      created_at: new Date().toISOString(),
    };
    entries.push(newEntry);
    writeWaitlistFile(entries);
    return { lastInsertRowid: newId };
  },

  getAllWaitlistEntries: (): WaitlistEntry[] => {
    const entries = readWaitlistFile();
    return entries.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  getWaitlistEntryByEmail: (email: string): WaitlistEntry | undefined => {
    const entries = readWaitlistFile();
    return entries.find(e => e.email.toLowerCase() === email.toLowerCase());
  },

  // Admin operations
  getAdminByUsername: (username: string): AdminUser | undefined => {
    const admin = readAdminFile();
    if (!admin || admin.username !== username) {
      return undefined;
    }
    return {
      id: 1,
      username: admin.username,
      password_hash: admin.passwordHash,
      created_at: new Date().toISOString(),
    };
  },

  createAdmin: (username: string, passwordHash: string) => {
    const admin = { username, passwordHash };
    writeFileSync(adminPath, JSON.stringify(admin, null, 2), 'utf-8');
    return { lastInsertRowid: 1 };
  },
};

// Initialize admin on module load
readAdminFile();

