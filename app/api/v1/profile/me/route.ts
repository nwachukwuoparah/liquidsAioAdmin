import {
    buildSampleAdminApiSuccessResponse,
    sampleAdminApiDelay,
} from "@/lib/admin/utilities/sample-admin-api-route";
import { SAMPLE_ADMIN_SETTINGS_PROFILE } from "@/lib/admin/mock-data/sample-admin-data";

/** Sample GET /profile/me matching the admin-token profile shape. */
export async function GET() {
    await sampleAdminApiDelay();
    return buildSampleAdminApiSuccessResponse({
        profile: {
            firstName: SAMPLE_ADMIN_SETTINGS_PROFILE.firstName,
            lastName: SAMPLE_ADMIN_SETTINGS_PROFILE.lastName,
            email: SAMPLE_ADMIN_SETTINGS_PROFILE.email,
            phoneNumber: "5551234567",
            phoneNumberCountryCode: "US",
            profilePicture: SAMPLE_ADMIN_SETTINGS_PROFILE.profileImageUrl ?? null,
            timezone: SAMPLE_ADMIN_SETTINGS_PROFILE.timezone,
        },
    });
}
