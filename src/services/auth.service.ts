import { BSKY_SERVICE } from "@/lib/constants";
import { createAgentAndLogin } from "@/state/session/agent";

export async function authenticateUser(identifier: string, password: string) {
  try {
    const result = await createAgentAndLogin(
      {
        service: BSKY_SERVICE,
        identifier,
        password,
      },
      (agent, did, event) => {
        // Handle session changes if needed
        console.log("Session event:", event);
      },
    );

    return {
      success: true,
      data: result,
    };
  } catch (error: any) {
    // Handle specific error cases
    if (error?.status === 429) {
      return {
        success: false,
        isRateLimit: true,
        error: "Too many attempts. Please try again later.",
      };
    }

    if (error?.status === 401) {
      return {
        success: false,
        error: "Invalid username or password",
      };
    }

    return {
      success: false,
      error: error?.message || "An unexpected error occurred",
    };
  }
}
