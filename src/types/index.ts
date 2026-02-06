export type MemberStatus = 'ACTIVE' | 'ALERT_8J' | 'EXCLUDED' | 'COMPLETED' | 'ARCHIVED';

export interface Group {
  id: string;
  name: string;
  contribution_amount: number; // e.g: 550
  pot_amount: number; // e.g: 220000
  rotation_days: number; // e.g: 4
  start_date: string; // ISO date
  penalty_per_day: number; // e.g: 200
  admin_fee?: number; // e.g: 50
  currency: string; // 'FCFA'
  password?: string; // Mot de passe du groupe
}

export interface Member {
  id: string;
  group_id: string;
  full_name: string;
  phone: string;
  photo_url?: string;
  join_date: string;
  pin_code?: string; // Code secret pour connexion membre
  status: MemberStatus;
}

export interface Attendance {
  id: string;
  member_id: string;
  date: string; // YYYY-MM-DD
  status: 'PAID' | 'LATE' | 'PENDING';
  amount_paid: number;
  penalty_paid: number;
  fee_paid: number;
}

export interface PotDistribution {
  id: string;
  group_id: string;
  member_id: string;
  distribution_date: string;
  amount: number;
  status: 'COMPLETED' | 'PENDING';
}
