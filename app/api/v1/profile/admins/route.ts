import {
    buildSampleAdminApiSuccessResponse,
    sampleAdminApiDelay,
} from "@/lib/admin/utilities/sample-admin-api-route";
import { SAMPLE_ADMIN_SETTINGS_PROFILE } from "@/lib/admin/mock-data/sample-admin-data";

/** Sample PATCH /profile/admins. */
export async function PATCH(request: Request) {
    await sampleAdminApiDelay();
    const body = (await request.json().catch(() => null)) as {
        firstName?: string;
        lastName?: string;
        phoneNumber?: string;
        phoneNumberCountryCode?: string;
        timezone?: string;
    } | null;

    return buildSampleAdminApiSuccessResponse({
        profile: {
            firstName: body?.firstName ?? SAMPLE_ADMIN_SETTINGS_PROFILE.firstName,
            lastName: body?.lastName ?? SAMPLE_ADMIN_SETTINGS_PROFILE.lastName,
            email: SAMPLE_ADMIN_SETTINGS_PROFILE.email,
            phoneNumber: body?.phoneNumber ?? SAMPLE_ADMIN_SETTINGS_PROFILE.phone,
            phoneNumberCountryCode: body?.phoneNumberCountryCode ?? "US",
            profilePicture: SAMPLE_ADMIN_SETTINGS_PROFILE.profileImageUrl ?? null,
            timezone: body?.timezone ?? SAMPLE_ADMIN_SETTINGS_PROFILE.timezone,
        },
    });
}
