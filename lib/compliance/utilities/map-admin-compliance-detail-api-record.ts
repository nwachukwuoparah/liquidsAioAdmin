import type { AdminComplianceAssigneeProfile } from "@/lib/compliance/types/admin-compliance-api.types";
import type {
    AdminComplianceDetailRecord,
    ComplianceDocumentRecord,
    ComplianceDocumentStatus,
} from "@/lib/compliance/types/admin-compliance-detail.types";
import type { ComplianceVerificationType } from "@/lib/compliance/constants/admin-compliance-review.constant";
import { resolveComplianceVerificationTypeFromAccountType } from "@/lib/compliance/constants/admin-compliance-review.constant";

export interface AdminComplianceDetailApiDocument {
    id?: string;
    title?: string;
    name?: string;
    documentName?: string;
    originalFilename?: string;
    category?: string;
    type?: string;
    documentType?: string;
    submittedAt?: string;
    createdAt?: string;
    status?: string;
    reviewStatus?: string;
    fileUrl?: string;
    fileId?: string;
    url?: string;
    filePath?: string;
}

export interface AdminComplianceKycRecord {
    id?: string;
    createdAt?: string;
    updatedAt?: string;
    status?: string;
    kycDocuments?: AdminComplianceDetailApiDocument[];
}

export interface AdminComplianceKybRecord {
    id?: string;
    createdAt?: string;
    updatedAt?: string;
    status?: string;
    kybDocuments?: AdminComplianceDetailApiDocument[];
}

export interface AdminComplianceDetailApiUser {
    id?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    profilePicture?: string | null;
    accountType?: string;
    account_type?: string;
    complianceReviewStatus?: string;
    compliance_review_status?: string;
    complianceUpdatedAt?: string | null;
    compliance_updated_at?: string | null;
    complianceSubmittedAt?: string;
    submittedAt?: string;
    createdAt?: string;
    assignedTo?: string;
    assignedReviewer?: AdminComplianceAssigneeProfile;
    assignee?: AdminComplianceAssigneeProfile;
    reviewAssignee?: AdminComplianceAssigneeProfile;
    complianceReviewAssignment?: AdminComplianceAssigneeProfile | string | null;
    kyc?: AdminComplianceKycRecord;
    kyb?: AdminComplianceKybRecord;
    documents?: AdminComplianceDetailApiDocument[];
    complianceDocuments?: AdminComplianceDetailApiDocument[];
    uploadedDocuments?: AdminComplianceDetailApiDocument[];
    documentsApprovedCount?: number;
    documentsTotalCount?: number;
    assigneeOptions?: string[];
    availableAssignees?: string[];
    reviewers?: Array<string | AdminComplianceAssigneeProfile>;
}

export interface AdminComplianceDetailApiPayload extends AdminComplianceDetailApiUser {
    complianceData?: AdminComplianceDetailApiUser;
    user?: AdminComplianceDetailApiUser;
}

const KYC_DOCUMENT_TYPE_LABELS: Record<string, string> = {
    gov_id: "Government ID",
    ein: "EIN Confirmation",
    w9: "W-9",
    business_license: "Business License",
};

function resolveAssigneeName(
    profile?: AdminComplianceAssigneeProfile | Record<string, unknown> | string | null,
): string {
    if (!profile) {
        return "";
    }

    if (typeof profile === "string") {
        return profile.trim();
    }

    if (typeof profile !== "object") {
        return "";
    }

    const firstName =
        typeof profile.firstName === "string"
            ? profile.firstName.trim()
            : typeof profile.first_name === "string"
              ? profile.first_name.trim()
              : "";
    const lastName =
        typeof profile.lastName === "string"
            ? profile.lastName.trim()
            : typeof profile.last_name === "string"
              ? profile.last_name.trim()
              : "";
    const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();

    if (fullName) {
        return fullName;
    }

    if (typeof profile.email === "string" && profile.email.trim()) {
        return profile.email.trim();
    }

    if (typeof profile.name === "string" && profile.name.trim()) {
        return profile.name.trim();
    }

    for (const nestedKey of ["admin", "assignedAdmin", "reviewer", "assignee", "user", "profile"]) {
        const nestedProfile = profile[nestedKey];
        const nestedName = resolveAssigneeName(
            nestedProfile as AdminComplianceAssigneeProfile | Record<string, unknown> | string | null,
        );

        if (nestedName) {
            return nestedName;
        }
    }

    return "";
}

function normalizeAccountType(value?: string): AdminComplianceDetailRecord["accountType"] {
    return value?.toLowerCase() === "seller" ? "seller" : "buyer";
}

function normalizeReviewStatus(
    value?: string,
): AdminComplianceDetailRecord["complianceReviewStatus"] {
    switch ((value ?? "pending").toLowerCase()) {
        case "in_review":
            return "in_review";
        case "approved":
            return "approved";
        case "rejected":
            return "rejected";
        default:
            return "pending";
    }
}

function normalizeDocumentStatus(value?: string): ComplianceDocumentStatus {
    switch ((value ?? "pending").toLowerCase()) {
        case "approved":
            return "approved";
        case "rejected":
            return "rejected";
        default:
            return "pending";
    }
}

function formatKycDocumentType(type?: string): string {
    if (!type?.trim()) {
        return "Document";
    }

    const normalizedType = type.trim().toLowerCase();
    return KYC_DOCUMENT_TYPE_LABELS[normalizedType] ?? type.replace(/_/g, " ");
}

function mapComplianceDocument(
    document: AdminComplianceDetailApiDocument,
    index: number,
    userId: string,
): ComplianceDocumentRecord {
    const documentType = document.type ?? document.documentType;

    return {
        id: document.id ?? `${userId}-document-${index + 1}`,
        title:
            document.originalFilename?.trim() ||
            document.title ||
            document.name ||
            document.documentName ||
            formatKycDocumentType(documentType),
        category:
            document.category ||
            formatKycDocumentType(documentType),
        submittedAt: document.submittedAt ?? document.createdAt ?? "",
        status: normalizeDocumentStatus(document.status ?? document.reviewStatus),
        fileUrl: document.fileUrl ?? document.fileId ?? document.url ?? document.filePath,
    };
}

function resolveComplianceUser(payload: AdminComplianceDetailApiPayload): AdminComplianceDetailApiUser {
    return payload.complianceData ?? payload.user ?? payload;
}

function resolveAssigneeOptions(payload: AdminComplianceDetailApiPayload): string[] {
    const user = resolveComplianceUser(payload);
    const rawOptions =
        payload.assigneeOptions ??
        payload.availableAssignees ??
        payload.reviewers ??
        user.assigneeOptions ??
        user.availableAssignees ??
        user.reviewers ??
        [];

    return rawOptions
        .map((option) => {
            if (typeof option === "string") {
                return option.trim();
            }

            return resolveAssigneeName(option);
        })
        .filter(Boolean);
}

function resolveAssignedTo(user: AdminComplianceDetailApiUser): string {
    if (user.assignedTo?.trim()) {
        return user.assignedTo.trim();
    }

    const assignment = user.complianceReviewAssignment;

    if (typeof assignment === "string" && assignment.trim()) {
        return assignment.trim();
    }

    if (assignment && typeof assignment === "object") {
        const assigneeName = resolveAssigneeName(assignment);
        if (assigneeName) {
            return assigneeName;
        }
    }

    const assignee = user.assignedReviewer ?? user.assignee ?? user.reviewAssignee;
    return resolveAssigneeName(assignee);
}

function resolveDocuments(
    payload: AdminComplianceDetailApiPayload,
    user: AdminComplianceDetailApiUser,
): AdminComplianceDetailApiDocument[] {
    const kybDocuments = user.kyb?.kybDocuments ?? [];
    if (kybDocuments.length > 0) {
        return kybDocuments;
    }

    const kycDocuments = user.kyc?.kycDocuments ?? [];
    if (kycDocuments.length > 0) {
        return kycDocuments;
    }

    return (
        payload.documents ??
        user.documents ??
        user.complianceDocuments ??
        user.uploadedDocuments ??
        []
    );
}

function resolveVerificationContext(user: AdminComplianceDetailApiUser): {
    verificationType: ComplianceVerificationType;
    verificationId: string;
} {
    if (user.kyb?.id?.trim()) {
        return {
            verificationType: "kyb",
            verificationId: user.kyb.id.trim(),
        };
    }

    if (user.kyc?.id?.trim()) {
        return {
            verificationType: "kyc",
            verificationId: user.kyc.id.trim(),
        };
    }

    const verificationType = resolveComplianceVerificationTypeFromAccountType(
        user.accountType ?? user.account_type,
    );

    return {
        verificationType,
        verificationId: "",
    };
}

/** Maps a backend compliance detail payload into the modal record shape. */
export function mapAdminComplianceDetailApiRecord(
    payload: AdminComplianceDetailApiPayload,
): AdminComplianceDetailRecord {
    const user = resolveComplianceUser(payload);
    const userId = user.id?.trim();

    if (!userId) {
        throw new Error("Compliance detail response is missing user id.");
    }

    const documents = resolveDocuments(payload, user).map((document, index) =>
        mapComplianceDocument(document, index, userId),
    );
    const documentsApprovedCount =
        user.documentsApprovedCount ??
        payload.documentsApprovedCount ??
        documents.filter((document) => document.status === "approved").length;
    const documentsTotalCount =
        user.documentsTotalCount ?? payload.documentsTotalCount ?? documents.length;
    const assigneeOptions = resolveAssigneeOptions(payload);
    const assignedTo = resolveAssignedTo(user);
    const { verificationType, verificationId } = resolveVerificationContext(user);

    return {
        id: userId,
        email: user.email?.trim() ?? "",
        firstName: user.firstName?.trim(),
        lastName: user.lastName?.trim(),
        profilePicture: user.profilePicture ?? undefined,
        accountType: normalizeAccountType(user.accountType ?? user.account_type),
        complianceReviewStatus: normalizeReviewStatus(
            user.complianceReviewStatus ?? user.compliance_review_status,
        ),
        submittedAt:
            user.complianceSubmittedAt ??
            user.submittedAt ??
            user.kyc?.createdAt ??
            user.createdAt ??
            user.complianceUpdatedAt ??
            user.compliance_updated_at ??
            "",
        complianceUpdatedAt: user.complianceUpdatedAt ?? user.compliance_updated_at ?? "",
        documentsApprovedCount,
        documentsTotalCount,
        assignedTo: assignedTo || "",
        assigneeOptions: assigneeOptions.length > 0 ? assigneeOptions : assignedTo ? [assignedTo] : [],
        verificationType,
        verificationId,
        documents,
    };
}
