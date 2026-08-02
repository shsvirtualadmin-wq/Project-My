import { BoardClass } from '../types';
import { getSubjectsForClassAndGroup } from './categories';

export interface DashboardStreamConfig {
  id: string; // e.g. "9-Medical", "11-ICS"
  classNum: BoardClass;
  group: string; // e.g. "Medical", "Computer Science", "ICS", "Pre-Engineering", "Pre-Medical"
  title: string; // e.g. "Class 9 – Medical"
  shortTitle: string; // e.g. "9th Medical"
  levelTag: string; // e.g. "Matric Part 1"
  description: string;
  badgeBg: string; // Tailwind background style or color
  badgeText: string;
  subjects: string[];
  mockExamTimeMinutes: number;
  mockQuestionCount: number;
}

export const DASHBOARD_CONFIGS: DashboardStreamConfig[] = [
  // Class 9
  {
    id: "9-Medical",
    classNum: 9,
    group: "Medical",
    title: "Class 9 – Medical Dashboard",
    shortTitle: "Class 9 Medical",
    levelTag: "Matric SSC Part 1",
    description: "FBISE Board Exam preparation portal for Class 9 Biology & Sciences stream.",
    badgeBg: "bg-[#AF52DE] dark:bg-[#BF5AF2]",
    badgeText: "text-[#AF52DE] dark:text-[#BF5AF2]",
    subjects: getSubjectsForClassAndGroup(9, "Medical"),
    mockExamTimeMinutes: 20,
    mockQuestionCount: 20,
  },
  {
    id: "9-Computer Science",
    classNum: 9,
    group: "Computer Science",
    title: "Class 9 – Computer Science (CS) Dashboard",
    shortTitle: "Class 9 CS",
    levelTag: "Matric SSC Part 1",
    description: "FBISE Board Exam preparation portal for Class 9 Computer Science & IT stream.",
    badgeBg: "bg-[#008299] dark:bg-[#40C8E0]",
    badgeText: "text-[#008299] dark:text-[#40C8E0]",
    subjects: getSubjectsForClassAndGroup(9, "Computer Science"),
    mockExamTimeMinutes: 20,
    mockQuestionCount: 20,
  },

  // Class 10
  {
    id: "10-Medical",
    classNum: 10,
    group: "Medical",
    title: "Class 10 – Medical Dashboard",
    shortTitle: "Class 10 Medical",
    levelTag: "Matric SSC Part 2",
    description: "FBISE Board Exam preparation portal for Class 10 Biology & Sciences stream.",
    badgeBg: "bg-[#AF52DE] dark:bg-[#BF5AF2]",
    badgeText: "text-[#AF52DE] dark:text-[#BF5AF2]",
    subjects: getSubjectsForClassAndGroup(10, "Medical"),
    mockExamTimeMinutes: 20,
    mockQuestionCount: 20,
  },
  {
    id: "10-Computer Science",
    classNum: 10,
    group: "Computer Science",
    title: "Class 10 – Computer Science (CS) Dashboard",
    shortTitle: "Class 10 CS",
    levelTag: "Matric SSC Part 2",
    description: "FBISE Board Exam preparation portal for Class 10 Computer Science & IT stream.",
    badgeBg: "bg-[#008299] dark:bg-[#40C8E0]",
    badgeText: "text-[#008299] dark:text-[#40C8E0]",
    subjects: getSubjectsForClassAndGroup(10, "Computer Science"),
    mockExamTimeMinutes: 20,
    mockQuestionCount: 20,
  },

  // Class 11
  {
    id: "11-Pre-Medical",
    classNum: 11,
    group: "Pre-Medical",
    title: "Class 11 – Pre-Medical Dashboard",
    shortTitle: "Class 11 Pre-Med",
    levelTag: "HSSC Part 1",
    description: "FBISE Board & Medical College Entry Test preparation for 11th Grade Pre-Medical.",
    badgeBg: "bg-[#AF52DE] dark:bg-[#BF5AF2]",
    badgeText: "text-[#AF52DE] dark:text-[#BF5AF2]",
    subjects: getSubjectsForClassAndGroup(11, "Pre-Medical"),
    mockExamTimeMinutes: 25,
    mockQuestionCount: 25,
  },
  {
    id: "11-Pre-Engineering",
    classNum: 11,
    group: "Pre-Engineering",
    title: "Class 11 – Pre-Engineering Dashboard",
    shortTitle: "Class 11 Pre-Eng",
    levelTag: "HSSC Part 1",
    description: "FBISE Board & Engineering Entry Test preparation for 11th Grade Pre-Engineering.",
    badgeBg: "bg-emerald-600 dark:bg-emerald-500",
    badgeText: "text-emerald-600 dark:text-emerald-400",
    subjects: getSubjectsForClassAndGroup(11, "Pre-Engineering"),
    mockExamTimeMinutes: 25,
    mockQuestionCount: 25,
  },
  {
    id: "11-ICS",
    classNum: 11,
    group: "ICS",
    title: "Class 11 – ICS Dashboard",
    shortTitle: "Class 11 ICS",
    levelTag: "HSSC Part 1",
    description: "FBISE Board & CS Entry Test preparation for 11th Grade Intermediate in Computer Science.",
    badgeBg: "bg-[#008299] dark:bg-[#40C8E0]",
    badgeText: "text-[#008299] dark:text-[#40C8E0]",
    subjects: getSubjectsForClassAndGroup(11, "ICS"),
    mockExamTimeMinutes: 25,
    mockQuestionCount: 25,
  },

  // Class 12
  {
    id: "12-Pre-Medical",
    classNum: 12,
    group: "Pre-Medical",
    title: "Class 12 – Pre-Medical Dashboard",
    shortTitle: "Class 12 Pre-Med",
    levelTag: "HSSC Part 2",
    description: "FBISE Board & Medical Entry Test (MDCAT) preparation for 12th Grade Pre-Medical.",
    badgeBg: "bg-[#AF52DE] dark:bg-[#BF5AF2]",
    badgeText: "text-[#AF52DE] dark:text-[#BF5AF2]",
    subjects: getSubjectsForClassAndGroup(12, "Pre-Medical"),
    mockExamTimeMinutes: 25,
    mockQuestionCount: 25,
  },
  {
    id: "12-Pre-Engineering",
    classNum: 12,
    group: "Pre-Engineering",
    title: "Class 12 – Pre-Engineering Dashboard",
    shortTitle: "Class 12 Pre-Eng",
    levelTag: "HSSC Part 2",
    description: "FBISE Board & Engineering Entry Test (ECAT/ECAT-NUST) preparation for 12th Grade Pre-Engineering.",
    badgeBg: "bg-emerald-600 dark:bg-emerald-500",
    badgeText: "text-emerald-600 dark:text-emerald-400",
    subjects: getSubjectsForClassAndGroup(12, "Pre-Engineering"),
    mockExamTimeMinutes: 25,
    mockQuestionCount: 25,
  },
  {
    id: "12-ICS",
    classNum: 12,
    group: "ICS",
    title: "Class 12 – ICS Dashboard",
    shortTitle: "Class 12 ICS",
    levelTag: "HSSC Part 2",
    description: "FBISE Board & CS University Entry Test preparation for 12th Grade ICS.",
    badgeBg: "bg-[#008299] dark:bg-[#40C8E0]",
    badgeText: "text-[#008299] dark:text-[#40C8E0]",
    subjects: getSubjectsForClassAndGroup(12, "ICS"),
    mockExamTimeMinutes: 25,
    mockQuestionCount: 25,
  },

  // MDCAT Section
  {
    id: "MDCAT-MDCAT",
    classNum: "MDCAT",
    group: "MDCAT",
    title: "MDCAT Entry Test Dashboard",
    shortTitle: "MDCAT Prep",
    levelTag: "Medical Entry Test",
    description: "National Medical & Dental College Admission Test (MDCAT) prep portal for Biology, Chemistry, Physics & English.",
    badgeBg: "bg-rose-600 dark:bg-rose-500",
    badgeText: "text-rose-600 dark:text-rose-400",
    subjects: getSubjectsForClassAndGroup("MDCAT", "MDCAT"),
    mockExamTimeMinutes: 30,
    mockQuestionCount: 30,
  },
];

export function getDashboardConfig(classNum?: BoardClass, group?: string): DashboardStreamConfig {
  if (!classNum || !group) return DASHBOARD_CONFIGS[0];

  if (classNum === 'MDCAT' || (group || '').toUpperCase() === 'MDCAT') {
    const mdcatCfg = DASHBOARD_CONFIGS.find(cfg => cfg.classNum === 'MDCAT');
    if (mdcatCfg) return mdcatCfg;
  }

  const normGroup = group.trim().toLowerCase();
  const match = DASHBOARD_CONFIGS.find(cfg => {
    if (cfg.classNum !== classNum) return false;
    const cfgGroup = cfg.group.toLowerCase();
    if (normGroup.includes('computer') || normGroup.includes('cs') || normGroup === 'ics') {
      return cfgGroup.includes('computer') || cfgGroup.includes('cs') || cfgGroup === 'ics';
    }
    if (normGroup.includes('engineering')) {
      return cfgGroup.includes('engineering');
    }
    if (normGroup.includes('medical')) {
      return cfgGroup.includes('medical');
    }
    return cfgGroup === normGroup;
  });

  return match || {
    id: `${classNum}-${group}`,
    classNum,
    group,
    title: `Class ${classNum} – ${group} Dashboard`,
    shortTitle: `Class ${classNum} ${group}`,
    levelTag: classNum === 'MDCAT' ? 'Medical Entry Test' : (Number(classNum) >= 11 ? `HSSC Part ${Number(classNum) === 11 ? 1 : 2}` : `Matric Part ${Number(classNum) === 9 ? 1 : 2}`),
    description: `FBISE Board exam prep portal for Class ${classNum} (${group}).`,
    badgeBg: "bg-[#FF9500] dark:bg-[#FF9F0A]",
    badgeText: "text-[#FF9500] dark:text-[#FF9F0A]",
    subjects: getSubjectsForClassAndGroup(classNum, group),
    mockExamTimeMinutes: 20,
    mockQuestionCount: 20,
  };
}
