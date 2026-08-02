import { BoardClass, DashboardCategory } from '../types';
import { isAdminEmail } from '../lib/supabase';

/**
 * Maps class and group strings to one of the 13 strict DashboardCategory enum values
 */
export function getCategoryFromClassAndGroup(classNum: BoardClass | string | undefined, group: string | undefined): DashboardCategory {
  const cStr = String(classNum || '').trim().toUpperCase();
  const gStr = String(group || '').trim().toLowerCase();

  if (cStr === 'MDCAT' || gStr === 'mdcat') {
    return 'mdcat';
  }

  if (cStr === 'TCAT' || gStr === 'tcat') {
    return 'tcat';
  }

  if (cStr === '9' || cStr === 'GRADE 9' || cStr === '9TH') {
    if (gStr.includes('comp') || gStr.includes('cs') || gStr.includes('ics')) return 'grade9_cs';
    return 'grade9_medical';
  }

  if (cStr === '10' || cStr === 'GRADE 10' || cStr === '10TH') {
    if (gStr.includes('comp') || gStr.includes('cs') || gStr.includes('ics')) return 'grade10_cs';
    return 'grade10_medical';
  }

  if (cStr === '11' || cStr === 'GRADE 11' || cStr === '11TH') {
    if (gStr.includes('ics') || gStr.includes('comp')) return 'grade11_ics';
    if (gStr.includes('eng')) return 'grade11_preengineering';
    return 'grade11_premedical';
  }

  if (cStr === '12' || cStr === 'GRADE 12' || cStr === '12TH') {
    if (gStr.includes('ics') || gStr.includes('comp')) return 'grade12_ics';
    if (gStr.includes('eng')) return 'grade12_preengineering';
    return 'grade12_premedical';
  }

  return 'grade11_premedical';
}

/**
 * Determines a user's authorized DashboardCategory based on their email / profile
 */
export function getCategoryFromProfile(userEmail: string | undefined, profile: any): DashboardCategory {
  if (userEmail && isAdminEmail(userEmail)) {
    return 'admin';
  }

  if (profile?.grade === 'MDCAT' || profile?.stream === 'MDCAT') {
    return 'mdcat';
  }

  if (profile?.grade === 'TCAT' || profile?.stream === 'TCAT') {
    return 'tcat';
  }

  if (profile?.grade && profile?.stream) {
    return getCategoryFromClassAndGroup(profile.grade, profile.stream);
  }

  return 'grade11_premedical';
}

/**
 * Maps a DashboardCategory back to classNum and group for dashboard rendering
 */
export function getClassAndGroupFromCategory(category: DashboardCategory): { classNum: BoardClass; group: string } {
  switch (category) {
    case 'grade9_cs':
      return { classNum: 9, group: 'Computer Science' };
    case 'grade9_medical':
      return { classNum: 9, group: 'Medical' };
    case 'grade10_cs':
      return { classNum: 10, group: 'Computer Science' };
    case 'grade10_medical':
      return { classNum: 10, group: 'Medical' };
    case 'grade11_ics':
      return { classNum: 11, group: 'ICS' };
    case 'grade11_premedical':
      return { classNum: 11, group: 'Pre-Medical' };
    case 'grade11_preengineering':
      return { classNum: 11, group: 'Pre-Engineering' };
    case 'grade12_ics':
      return { classNum: 12, group: 'ICS' };
    case 'grade12_preengineering':
      return { classNum: 12, group: 'Pre-Engineering' };
    case 'grade12_premedical':
      return { classNum: 12, group: 'Pre-Medical' };
    case 'mdcat':
      return { classNum: 'MDCAT', group: 'MDCAT' };
    case 'tcat':
      return { classNum: 'TCAT', group: 'TCAT' };
    case 'admin':
      return { classNum: 11, group: 'Pre-Medical' };
    default:
      return { classNum: 9, group: 'Medical' };
  }
}

/**
 * Route level guard: checks whether user of `userCategory` can access `targetCategory`.
 * Admin can access everything. Non-admin users are restricted strictly to their own category.
 */
export function isCategoryAccessAllowed(userCategory: DashboardCategory, targetCategory: DashboardCategory): boolean {
  if (userCategory === 'admin') return true;
  return userCategory === targetCategory;
}
