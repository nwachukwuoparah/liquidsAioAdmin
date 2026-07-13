import { z } from "zod";
import { authEmailFieldSchema } from "@/lib/auth/schemas/auth-schema-fields";

/** Validates the add-team-member invite form. */
export const adminInviteTeamMemberSchema = z.object({
    email: authEmailFieldSchema,
    roleId: z.string(),
    permissions: z.array(
        z.object({
            id: z.string().uuid(),
            include: z.boolean()
        })
    ).optional(),
    message: z.string().trim().optional(),
});

export type AdminInviteTeamMemberFormValues = z.infer<typeof adminInviteTeamMemberSchema>;


/** API request body for inviting an admin team member. */
export interface AdminInviteTeamMemberRequestBody {
    email: string;
    roleId: AdminInviteTeamMemberFormValues["roleId"];
}

/**
 * Maps validated form values to the admin invite API request body.
 * @param formValues - Validated add-team-member form values.
 */
export function toAdminInviteTeamMemberRequestBody(
    formValues: AdminInviteTeamMemberFormValues,
): AdminInviteTeamMemberRequestBody {
    return {
        email: formValues.email.trim(),
        roleId: formValues.roleId,
    };
}
