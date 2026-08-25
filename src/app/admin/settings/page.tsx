import { SettingsService } from '@/services/settings.service';
import { ProfileForm } from './ProfileForm';
import { SocialLinksManager } from './SocialLinksManager';
import { DatabaseBackupManager } from './DatabaseBackupManager';
import { Settings } from 'lucide-react';

export default async function AdminSettingsPage() {
  const [profile, socialLinks] = await Promise.all([
    SettingsService.getOperatorProfile(),
    SettingsService.getSocialLinks(),
  ]);

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header Bar */}
      <div>
        <h1 className="text-lg font-bold font-mono text-terminal-text-primary flex items-center space-x-2">
          <Settings className="w-5 h-5 text-terminal-primary" />
          <span>System & Operator Configuration</span>
        </h1>
        <p className="text-xs font-mono text-terminal-text-secondary">
          Manage system identity, social channels, and full-database backup portability.
        </p>
      </div>

      {/* 1. Profile Settings */}
      <ProfileForm initialData={profile} />

      {/* 2. Social Links Management */}
      <SocialLinksManager initialLinks={socialLinks} />

      {/* 3. Database Backup & Portability */}
      <DatabaseBackupManager />
    </div>
  );
}
