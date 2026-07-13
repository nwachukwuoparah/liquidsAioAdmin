import { z } from "zod";

/** Validates the rejection reason required by the compliance reject endpoint. */
export const complianceRejectionReasonSchema = z
    .string()
    .trim()
    .min(1, "Add a reason for rejecting this document.");

export type ComplianceRejectionReasonFormValues = {
    rejectionReason: string;
};
