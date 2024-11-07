export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | null;

// Define complete interface for Clerk user data
export interface ClerkUserData {
  email_addresses: Array<{
    email_address: string;
    verification?: {
      status: 'verified' | 'unverified';
    };
  }>;
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | null;
  birthday?: string;
}


