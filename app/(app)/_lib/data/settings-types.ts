export interface OwnerPreferences {
  fullName: string;
  email: string;
  phone: string;
  clinicBranch: string;
  emergencyPhone: string;
  visitReminders: boolean;
  vaccinationAlerts: boolean;
}

export interface CarePlan {
  id: string;
  name: string;
  provider?: string;
  reference?: string;
}

export interface OwnerSettings extends OwnerPreferences {
  avatarUrl?: string | null;
  savedAt?: string;
  memberSince?: string;
  memberId?: string;
  carePlans?: CarePlan[];
}
