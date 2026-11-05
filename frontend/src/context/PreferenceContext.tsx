import React, { createContext, useContext, useState, useEffect } from 'react';
import { College, Branch, PreferenceItem } from '../types';
import { calculateReachability } from '../services/api';
import { useStudent } from './StudentContext';

interface PreferenceContextType {
  preferences: PreferenceItem[];
  addPreference: (college: College, branch: Branch, category?: string) => boolean;
  removePreference: (id: string) => void;
  moveUp: (index: number) => void;
  moveDown: (index: number) => void;
  reorder: (startIndex: number, endIndex: number) => void;
  clearPreferences: () => void;
  isInPreferences: (collegeCode: number, branchCode: number) => boolean;
  toastMessage: string | null;
  clearToast: () => void;
}

const PreferenceContext = createContext<PreferenceContextType | undefined>(undefined);

const DEFAULT_PREFERENCES: PreferenceItem[] = [
  {
    id: '6006-24510-GOPENS',
    preferenceNumber: 1,
    college_code: 6006,
    college_name: 'COEP Technological University, Pune',
    branch_code: 24510,
    branch_name: 'Computer Engineering',
    district: 'Pune',
    institute_type: 'Government Autonomous',
    category: 'GOPENS',
    previous_cutoff: 99.67,
    predicted_cutoff: 99.82,
    lower_bound: 99.40,
    upper_bound: 100.0,
    intake: 300,
    reachability: 'Ambitious',
    reachabilityDiff: -11.32,
    addedAt: new Date().toISOString()
  },
  {
    id: '6271-24510-GOPENS',
    preferenceNumber: 2,
    college_code: 6271,
    college_name: 'Pune Institute of Computer Technology (PICT), Pune',
    branch_code: 24510,
    branch_name: 'Information Technology',
    district: 'Pune',
    institute_type: 'Private Autonomous',
    category: 'GOPENS',
    previous_cutoff: 98.42,
    predicted_cutoff: 98.70,
    lower_bound: 98.20,
    upper_bound: 99.10,
    intake: 180,
    reachability: 'Ambitious',
    reachabilityDiff: -10.20,
    addedAt: new Date().toISOString()
  },
  {
    id: '6175-24510-GOPENS',
    preferenceNumber: 3,
    college_code: 6175,
    college_name: 'Pimpri Chinchwad College of Engineering (PCCOE), Pune',
    branch_code: 24510,
    branch_name: 'Computer Engineering',
    district: 'Pune',
    institute_type: 'Private Autonomous',
    category: 'GOPENS',
    previous_cutoff: 91.20,
    predicted_cutoff: 90.50,
    lower_bound: 89.80,
    upper_bound: 91.50,
    intake: 240,
    reachability: 'Borderline',
    reachabilityDiff: -2.00,
    addedAt: new Date().toISOString()
  },
  {
    id: '6146-24510-GOPENS',
    preferenceNumber: 4,
    college_code: 6146,
    college_name: 'MIT Academy of Engineering, Alandi, Pune',
    branch_code: 24510,
    branch_name: 'Computer Engineering',
    district: 'Pune',
    institute_type: 'Private Autonomous',
    category: 'GOPENS',
    previous_cutoff: 89.10,
    predicted_cutoff: 88.30,
    lower_bound: 87.50,
    upper_bound: 89.40,
    intake: 180,
    reachability: 'Borderline',
    reachabilityDiff: +0.20,
    addedAt: new Date().toISOString()
  },
  {
    id: '6177-24510-GOPENS',
    preferenceNumber: 5,
    college_code: 6177,
    college_name: 'Sinhgad College of Engineering, Vadgaon, Pune',
    branch_code: 24510,
    branch_name: 'Computer Engineering',
    district: 'Pune',
    institute_type: 'Private Non-Autonomous',
    category: 'GOPENS',
    previous_cutoff: 85.50,
    predicted_cutoff: 84.80,
    lower_bound: 83.90,
    upper_bound: 86.00,
    intake: 240,
    reachability: 'Reachable',
    reachabilityDiff: +3.70,
    addedAt: new Date().toISOString()
  },
  {
    id: '6272-24510-GOPENS',
    preferenceNumber: 6,
    college_code: 6272,
    college_name: 'Dr. D. Y. Patil Institute of Technology, Pimpri, Pune',
    branch_code: 24510,
    branch_name: 'Information Technology',
    district: 'Pune',
    institute_type: 'Private Autonomous',
    category: 'GOPENS',
    previous_cutoff: 83.20,
    predicted_cutoff: 82.50,
    lower_bound: 81.60,
    upper_bound: 83.80,
    intake: 180,
    reachability: 'Reachable',
    reachabilityDiff: +6.00,
    addedAt: new Date().toISOString()
  },
  {
    id: '6315-24510-GOPENS',
    preferenceNumber: 7,
    college_code: 6315,
    college_name: 'JSPM Rajarshi Shahu College of Engineering, Tathawade',
    branch_code: 24510,
    branch_name: 'Computer Engineering',
    district: 'Pune',
    institute_type: 'Private Autonomous',
    category: 'GOPENS',
    previous_cutoff: 81.40,
    predicted_cutoff: 80.90,
    lower_bound: 79.90,
    upper_bound: 82.00,
    intake: 180,
    reachability: 'Reachable',
    reachabilityDiff: +7.60,
    addedAt: new Date().toISOString()
  }
];

export const PreferenceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile } = useStudent();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [preferences, setPreferences] = useState<PreferenceItem[]>(() => {
    try {
      const saved = localStorage.getItem('aapla_katta_preferences');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load preferences from storage', e);
    }
    return DEFAULT_PREFERENCES;
  });

  useEffect(() => {
    try {
      localStorage.setItem('aapla_katta_preferences', JSON.stringify(preferences));
    } catch (e) {
      console.error('Failed to save preferences', e);
    }
  }, [preferences]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 3500);
  };

  const isInPreferences = (collegeCode: number, branchCode: number) => {
    return preferences.some(p => p.college_code === collegeCode && p.branch_code === branchCode);
  };

  const addPreference = (college: College, branch: Branch, categoryCode?: string): boolean => {
    if (isInPreferences(college.college_code, branch.branch_code)) {
      showToast(`Already in list: ${college.college_name} (${branch.branch_name})`);
      return false;
    }

    const cat = categoryCode || profile.category || 'GOPENS';
    const catData = branch.category_cutoffs[cat] || {
      previous_cutoff: branch.previous_cutoff,
      predicted_cutoff: branch.predicted_cutoff,
      lower_bound: Number((branch.predicted_cutoff - 5.9).toFixed(2)),
      upper_bound: Number((branch.predicted_cutoff + 5.9).toFixed(2))
    };

    const reach = calculateReachability(profile.percentile, catData.predicted_cutoff);

    const newItem: PreferenceItem = {
      id: `${college.college_code}-${branch.branch_code}-${Date.now()}`,
      preferenceNumber: preferences.length + 1,
      college_code: college.college_code,
      college_name: college.college_name,
      branch_code: branch.branch_code,
      branch_name: branch.branch_name,
      district: college.district,
      institute_type: college.institute_type,
      category: cat,
      previous_cutoff: catData.previous_cutoff,
      predicted_cutoff: catData.predicted_cutoff,
      lower_bound: catData.lower_bound,
      upper_bound: catData.upper_bound,
      intake: branch.intake,
      reachability: reach.level,
      reachabilityDiff: reach.diff,
      addedAt: new Date().toISOString()
    };

    setPreferences(prev => [...prev, newItem]);
    showToast(`Added to preference list: Preference #${preferences.length + 1}`);
    return true;
  };

  const removePreference = (id: string) => {
    setPreferences(prev => {
      const filtered = prev.filter(p => p.id !== id);
      return filtered.map((item, idx) => ({ ...item, preferenceNumber: idx + 1 }));
    });
    showToast('Preference removed.');
  };

  const moveUp = (index: number) => {
    if (index <= 0) return;
    setPreferences(prev => {
      const list = [...prev];
      const temp = list[index];
      list[index] = list[index - 1];
      list[index - 1] = temp;
      return list.map((item, idx) => ({ ...item, preferenceNumber: idx + 1 }));
    });
  };

  const moveDown = (index: number) => {
    if (index >= preferences.length - 1) return;
    setPreferences(prev => {
      const list = [...prev];
      const temp = list[index];
      list[index] = list[index + 1];
      list[index + 1] = temp;
      return list.map((item, idx) => ({ ...item, preferenceNumber: idx + 1 }));
    });
  };

  const reorder = (startIndex: number, endIndex: number) => {
    if (startIndex === endIndex) return;
    setPreferences(prev => {
      const result = [...prev];
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result.map((item, idx) => ({ ...item, preferenceNumber: idx + 1 }));
    });
  };

  const clearPreferences = () => {
    setPreferences([]);
    localStorage.removeItem('aapla_katta_preferences');
    showToast('Preference list cleared.');
  };

  return (
    <PreferenceContext.Provider
      value={{
        preferences,
        addPreference,
        removePreference,
        moveUp,
        moveDown,
        reorder,
        clearPreferences,
        isInPreferences,
        toastMessage,
        clearToast: () => setToastMessage(null)
      }}
    >
      {children}
    </PreferenceContext.Provider>
  );
};

export const usePreferences = () => {
  const context = useContext(PreferenceContext);
  if (!context) throw new Error('usePreferences must be used within a PreferenceProvider');
  return context;
};
