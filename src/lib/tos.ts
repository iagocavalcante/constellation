import AsyncStorage from "@react-native-async-storage/async-storage";

const TOS_ACCEPTANCE_KEY = "@tos_accepted";
const CURRENT_TOS_VERSION = "1.0.0";

export interface TosAcceptance {
  accepted: boolean;
  timestamp: string;
  version: string;
}

/**
 * Check if the user has accepted the current version of ToS
 */
export async function hasAcceptedTos(): Promise<boolean> {
  try {
    const data = await AsyncStorage.getItem(TOS_ACCEPTANCE_KEY);
    if (!data) return false;

    const acceptance: TosAcceptance = JSON.parse(data);

    // Check if they accepted and if it's the current version
    return acceptance.accepted && acceptance.version === CURRENT_TOS_VERSION;
  } catch (error) {
    console.error("Error checking ToS acceptance:", error);
    return false;
  }
}

/**
 * Save ToS acceptance
 */
export async function acceptTos(): Promise<void> {
  const acceptanceData: TosAcceptance = {
    accepted: true,
    timestamp: new Date().toISOString(),
    version: CURRENT_TOS_VERSION,
  };

  await AsyncStorage.setItem(TOS_ACCEPTANCE_KEY, JSON.stringify(acceptanceData));
}

/**
 * Get ToS acceptance details
 */
export async function getTosAcceptance(): Promise<TosAcceptance | null> {
  try {
    const data = await AsyncStorage.getItem(TOS_ACCEPTANCE_KEY);
    if (!data) return null;

    return JSON.parse(data);
  } catch (error) {
    console.error("Error getting ToS acceptance:", error);
    return null;
  }
}

/**
 * Clear ToS acceptance (useful for testing or if ToS version changes)
 */
export async function clearTosAcceptance(): Promise<void> {
  await AsyncStorage.removeItem(TOS_ACCEPTANCE_KEY);
}
