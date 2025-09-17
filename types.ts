export type SponsorshipType = 'monetary' | 'in-kind' | 'service';

export interface SponsorshipTier {
  id: string;
  name: string;
  type: SponsorshipType;
  amount: number; // For monetary type
  description?: string; // For in-kind/service types
  value?: number; // Estimated value for non-monetary types
  perks: string[];
}

export type FundingType = 'open' | 'goal-based';

export interface Sponsor {
  id: string;
  companyName: string;
  tierName: string;
  logoUrl: string;
}

export interface Festival {
  id:string;
  name: string;
  location: string;
  date: string;
  description: string;
  longDescription: string;
  attendance: number;
  imageUrl: string;
  sponsorshipTiers: SponsorshipTier[];
  region: string;
  fundingType: FundingType;
  fundingGoal?: number;
  currentFunding?: number;
  sponsors?: Sponsor[];
}