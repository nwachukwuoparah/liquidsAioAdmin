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
    userId?: string;
    firstName?: string;
    lastName?: string;
    createdAt?: string;
    updatedAt?: string;
    status?: string;
    kycDocuments?: AdminComplianceDetailApiDocument[];
}

export interface AdminComplianceKybRecord {
    id?: string;
    userId?: string;
    businessName?: string;
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
    kyb?: AdminComplianceKybRecord;
    kyc?: AdminComplianceKycRecord;
}

const KYC_DOCUMENT_TYPE_LABELS: Record<string, string> = {
    gov_id: "Government ID",
    ein: "EIN Confirmation",
    ein_document: "EIN Confirmation",
    w9: "W-9",
    business_license: "Business License",
    state_business_license: "State Business License",
    certificate_of_incorporation: "Certificate of Incorporation",
    articles_of_incorporation: "Articles of Incorporation",
    bank_statement: "Bank Statement",
    utility_bill: "Utility Bill",
    tax_id: "Tax ID",
    tin: "TIN Confirmation",
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
            : typeof profile.firstName === "string"
              ? profile.firstName.trim()
              : "";
    const lastName =
        typeof profile.lastName === "string"
            ? profile.lastName.trim()
            : typeof profile.lastName === "string"
              ? profile.lastName.trim()
              : "";
    const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();

    if (fullName) {
        return fullName;
    }

    if (typeof profile.email === "string" && profile.email.trim()) {
        return profile.email.trim();
    }

    for (const nestedKey of ["admin", "assignedAdmin", "reviewer", "assignee", "user", "profile"]) {
        const nestedProfile = profile[nestedKey as keyof typeof profile];
        const nestedName = resolveAssigneeName(
            nestedProfile as AdminComplianceAssigneeProfile | Record<string, unknown> | string | null,
        );

        if (nestedName) {
            return nestedName;
        }
    }

    return "";
}

function normalizeAccountType(
    value?: string,
    hasKyb = false,
): AdminComplianceDetailRecord["accountType"] {
    if (value?.toLowerCase() === "seller") {
        return "seller";
    }
    if (value?.toLowerCase() === "buyer") {
        return "buyer";
    }
    return hasKyb ? "seller" : "buyer";
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
    if (KYC_DOCUMENT_TYPE_LABELS[normalizedType]) {
        return KYC_DOCUMENT_TYPE_LABELS[normalizedType];
    }

    return type
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function mapComplianceDocument(
    document: AdminComplianceDetailApiDocument,
    index: number,
    userId: string,
    verificationType?: ComplianceVerificationType,
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
        verificationType,
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

function resolveAssignedTo(
    payload: AdminComplianceDetailApiPayload,
    user: AdminComplianceDetailApiUser,
): string {
    if (user.assignedTo?.trim()) {
        return user.assignedTo.trim();
    }
    if (payload.assignedTo?.trim()) {
        return payload.assignedTo.trim();
    }

    const assignment = user.complianceReviewAssignment ?? payload.complianceReviewAssignment;

    if (typeof assignment === "string" && assignment.trim()) {
        return assignment.trim();
    }

    if (assignment && typeof assignment === "object") {
        if ("status" in assignment && assignment.status === "released") {
            return "";
        }
        const assigneeName = resolveAssigneeName(assignment);
        if (assigneeName) {
            return assigneeName;
        }
    }

    const assignee =
        user.assignedReviewer ??
        user.assignee ??
        user.reviewAssignee ??
        payload.assignedReviewer ??
        payload.assignee ??
        payload.reviewAssignee;

    return resolveAssigneeName(assignee);
}

interface ResolvedApiDocument {
    document: AdminComplianceDetailApiDocument;
    verificationType?: ComplianceVerificationType;
}

function resolveDocuments(
    payload: AdminComplianceDetailApiPayload,
    user: AdminComplianceDetailApiUser,
): ResolvedApiDocument[] {
    const kyb = payload.kyb ?? user.kyb;
    const kyc = payload.kyc ?? user.kyc;

    const kybDocuments: ResolvedApiDocument[] = (kyb?.kybDocuments ?? []).map((document) => ({
        document,
        verificationType: "kyb",
    }));

    const kycDocuments: ResolvedApiDocument[] = (kyc?.kycDocuments ?? []).map((document) => ({
        document,
        verificationType: "kyc",
    }));

    const combinedKycKyb = [...kybDocuments, ...kycDocuments];
    if (combinedKycKyb.length > 0) {
        return combinedKycKyb;
    }

    const fallbackDocs =
        payload.documents ??
        user.documents ??
        user.complianceDocuments ??
        user.uploadedDocuments ??
        [];

    const defaultVerificationType = resolveComplianceVerificationTypeFromAccountType(
        user.accountType ?? user.account_type ?? payload.accountType ?? payload.account_type,
    );

    return fallbackDocs.map((document) => ({
        document,
        verificationType: defaultVerificationType,
    }));
}

function resolveVerificationContext(
    payload: AdminComplianceDetailApiPayload,
    user: AdminComplianceDetailApiUser,
): {
    verificationType: ComplianceVerificationType;
    verificationId: string;
} {
    const kyb = payload.kyb ?? user.kyb;
    const kyc = payload.kyc ?? user.kyc;

    if (kyb?.id?.trim()) {
        return {
            verificationType: "kyb",
            verificationId: kyb.id.trim(),
        };
    }

    if (kyc?.id?.trim()) {
        return {
            verificationType: "kyc",
            verificationId: kyc.id.trim(),
        };
    }

    const verificationType = resolveComplianceVerificationTypeFromAccountType(
        user.accountType ?? user.account_type ?? payload.accountType ?? payload.account_type,
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
    const userId = user.id?.trim() ?? payload.id?.trim();

    if (!userId) {
        throw new Error("Compliance detail response is missing user id.");
    }

    const kyb = payload.kyb ?? user.kyb;
    const kyc = payload.kyc ?? user.kyc;

    const resolvedDocuments = resolveDocuments(payload, user);
    const documents = resolvedDocuments.map(({ document, verificationType }, index) =>
        mapComplianceDocument(document, index, userId, verificationType),
    );
    const documentsApprovedCount =
        user.documentsApprovedCount ??
        payload.documentsApprovedCount ??
        documents.filter((document) => document.status === "approved").length;
    const documentsTotalCount =
        user.documentsTotalCount ?? payload.documentsTotalCount ?? documents.length;
    const assigneeOptions = resolveAssigneeOptions(payload);
    const assignedTo = resolveAssignedTo(payload, user);
    const { verificationType, verificationId } = resolveVerificationContext(payload, user);

    return {
        id: userId,
        email: user.email?.trim() ?? payload.email?.trim() ?? "",
        firstName: user.firstName?.trim() ?? payload.firstName?.trim(),
        lastName: user.lastName?.trim() ?? payload.lastName?.trim(),
        profilePicture: user.profilePicture ?? payload.profilePicture ?? undefined,
        accountType: normalizeAccountType(
            user.accountType ?? user.account_type ?? payload.accountType ?? payload.account_type,
            Boolean(kyb?.id || kyb?.businessName || (kyb?.kybDocuments && kyb.kybDocuments.length > 0)),
        ),
        complianceReviewStatus: normalizeReviewStatus(
            user.complianceReviewStatus ??
                user.compliance_review_status ??
                payload.complianceReviewStatus ??
                payload.compliance_review_status,
        ),
        submittedAt:
            user.complianceSubmittedAt ??
            user.submittedAt ??
            payload.complianceSubmittedAt ??
            payload.submittedAt ??
            kyb?.createdAt ??
            kyc?.createdAt ??
            user.createdAt ??
            payload.createdAt ??
            user.complianceUpdatedAt ??
            user.compliance_updated_at ??
            payload.complianceUpdatedAt ??
            payload.compliance_updated_at ??
            "",
        complianceUpdatedAt:
            user.complianceUpdatedAt ??
            user.compliance_updated_at ??
            payload.complianceUpdatedAt ??
            payload.compliance_updated_at ??
            kyb?.updatedAt ??
            kyc?.updatedAt ??
            "",
        documentsApprovedCount,
        documentsTotalCount,
        assignedTo: assignedTo || "",
        assigneeOptions: assigneeOptions.length > 0 ? assigneeOptions : assignedTo ? [assignedTo] : [],
        verificationType,
        verificationId,
        documents,
    };
}
