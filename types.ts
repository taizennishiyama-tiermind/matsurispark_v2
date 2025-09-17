export type SponsorshipType = 'monetary' | 'in-kind' | 'service';
export type FundingType = 'open' | 'goal-based';

// Corresponds to the 'sponsorship_tiers' table
export interface SponsorshipTier {
  id: string; // uuid
  festival_id: string; // uuid
  name: string;
  type: SponsorshipType;
  amount: number; // For monetary type
  description?: string; // For in-kind/service types
  value?: number; // Estimated value for non-monetary types
  perks: string[]; // JSONB stored as an array of strings
  created_at?: string; // timestamptz
  updated_at?: string; // timestamptz
}

// Corresponds to the 'sponsors' table
export interface Sponsor {
  id: string; // uuid
  company_name: string;
  logo_url: string;
  sponsorship_tier_id: string; // uuid
  festival_id: string; // uuid
  created_at?: string; // timestamptz
  updated_at?: string; // timestamptz

  // For joined data
  tierName?: string;
  sponsorship_tiers?: { name: string }; // From the join query
}

// Corresponds to the 'festivals' table
export interface Festival {
  id: string; // uuid
  name: string;
  location: string;
  date: string;
  description: string;
  long_description: string;
  attendance: number;
  image_url: string;
  region: string;
  funding_type: FundingType;
  funding_goal?: number;
  current_funding?: number;
  created_at?: string; // timestamptz
  updated_at?: string; // timestamptz
}
