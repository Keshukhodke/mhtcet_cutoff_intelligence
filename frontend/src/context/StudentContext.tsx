import React, { createContext, useContext, useState, useEffect } from 'react';
import { StudentProfile } from '../types';

const DEFAULT_PROFILE: StudentProfile = {
  examYear: 2026,
  percentile: 88.50,
  rank: 18450,
  category: 'GOPENS',
  gender: 'Male',
  homeUniversity: 'Savitribai Phule Pune University (SPPU)',
  domicile: 'Maharashtra State (Type A)',
  isTFWS: false,
  isEWS: false,
  minorityStatus: 'None',
  specialQuota: 'None',
  preferredBranches: ['Computer Engineering', 'Information Technology', 'Artificial Intelligence and Data Science'],
  preferredDistricts: ['Pune', 'Mumbai'],
  preferredInstituteTypes: ['Government Autonomous', 'Private Autonomous'],
  isCompleted: true
};

interface StudentContextType {
  profile: StudentProfile;
  updateProfile: (updates: Partial<StudentProfile>) => void;
  resetProfile: () => void;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export const StudentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<StudentProfile>(() => {
    try {
      const saved = localStorage.getItem('aapla_katta_student_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load profile from storage', e);
    }
    return DEFAULT_PROFILE;
  });

  useEffect(() => {
    try {
      localStorage.setItem('aapla_katta_student_profile', JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save profile', e);
    }
  }, [profile]);

  const updateProfile = (updates: Partial<StudentProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  const resetProfile = () => {
    setProfile(DEFAULT_PROFILE);
    localStorage.removeItem('aapla_katta_student_profile');
  };

  return (
    <StudentContext.Provider value={{ profile, updateProfile, resetProfile }}>
      {children}
    </StudentContext.Provider>
  );
};

export const useStudent = () => {
  const context = useContext(StudentContext);
  if (!context) throw new Error('useStudent must be used within a StudentProvider');
  return context;
};
