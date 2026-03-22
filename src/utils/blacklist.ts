import { ofetch, FetchError } from 'ofetch';

interface KarmaType {
  karma: string;
}

interface KarmaIdentityType {
  identity_type: string;
}

interface ReportingEntity {
  name: string;
  email: string;
}

interface KarmaData {
  karma_identity: string;
  amount_in_contention: string;
  reason: string | null;
  default_date: string;
  karma_type: KarmaType;
  karma_identity_type: KarmaIdentityType;
  reporting_entity: ReportingEntity;
}

interface AdjutorKarmaResponse {
  status: 'success' | 'error';
  message: string;
  data: KarmaData | null;
  meta: {
    cost: number;
    balance: number;
  };
}

/**
 * Checks if an email is flagged on the Lendsqr Adjutor Karma blacklist.
 * Returns true if the user is blacklisted, false if they are clean.
 * Any API error is treated as non-blacklisted to avoid blocking legitimate users
 * due to third-party downtime — log the error for ops visibility.
 */
export const isBlacklisted = async (email: string): Promise<boolean> => {
  try {
    const response = await ofetch<AdjutorKarmaResponse>(
      `/verification/karma/${email}`,
      {
        baseURL: process.env.ADJUTOR_BASE_URL,
        headers: {
          Authorization: `Bearer ${process.env.ADJUTOR_API_KEY}`,
        },
        retry: 0,
      },
    );

    return response?.data !== null && response?.data !== undefined;
  } catch (error) {
    if (error instanceof FetchError && error.response?.status === 404) {
      return false;
    }

    console.error('[Blacklist Check Error]', error);
    return true;
  }
};
