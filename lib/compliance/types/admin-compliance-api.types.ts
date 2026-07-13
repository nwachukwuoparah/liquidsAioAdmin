export interface AdminComplianceApiCursor {
    cursor_id?: string;
    cursor_sort_at?: string;
}

export interface AdminComplianceAssigneeProfile {
    firstName?: string;
    lastName?: string;
    email?: string;
}

export interface AdminComplianceApiRecord {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    profilePicture?: string;
    accountType?: string;
    account_type?: string;
    complianceReviewStatus?: string;
    compliance_review_status?: string;
    complianceUpdatedAt?: string;
    compliance_updated_at?: string;
    assignedTo?: string;
    assignedReviewer?: AdminComplianceAssigneeProfile;
    assignee?: AdminComplianceAssigneeProfile;
    reviewAssignee?: AdminComplianceAssigneeProfile;
}

export interface AdminComplianceReviewsPage {
    results: AdminComplianceApiRecord[];
    hasNext: boolean;
    nextCursor?: AdminComplianceApiCursor | null;
}

export interface AdminComplianceReviewsResponseBody {
    status?: string;
    message?: string;
    data?: AdminComplianceReviewsPage;
    results?: AdminComplianceApiRecord[];
    users?: AdminComplianceApiRecord[];
    hasNext?: boolean;
    nextCursor?: AdminComplianceApiCursor | null;
}

export interface FetchAdminComplianceReviewsPageParams extends Record<string, string | undefined> {
    cursor_id?: string;
    cursor_sort_at?: string;
    limit?: number;
}
