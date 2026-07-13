import {
    buildSampleAdminApiSuccessResponse,
    getSampleAdminRouteSearchParams,
    sampleAdminApiDelay,
} from "@/lib/admin/utilities/sample-admin-api-route";
import { SAMPLE_ADMIN_COMPLIANCE_REVIEWS } from "@/lib/admin/mock-data/sample-admin-data";
import type { AdminComplianceApiRecord } from "@/lib/compliance/types/admin-compliance-api.types";

const REVIEW_STATUS_BY_API_VALUE: Record<string, AdminComplianceApiRecord["complianceReviewStatus"]> = {
    pending: "pending",
    in_review: "in_review",
    approved: "approved",
    rejected: "rejected",
};

function normalizeReviewStatusParam(value: string | null): string | null {
    if (!value) {
        return null;
    }

    return REVIEW_STATUS_BY_API_VALUE[value] ? value : null;
}

function toApiRecord(review: (typeof SAMPLE_ADMIN_COMPLIANCE_REVIEWS)[number], index: number): AdminComplianceApiRecord {
    return {
        id: review.id,
        email: review.email,
        firstName: review.name.includes("@") ? undefined : review.name.split(" ")[0],
        lastName: review.name.includes("@") ? undefined : review.name.split(" ").slice(1).join(" ") || undefined,
        accountType: review.accountType.toLowerCase(),
        complianceReviewStatus: review.reviewStatus.toLowerCase().replace(" ", "_"),
        complianceUpdatedAt: new Date(Date.now() - index * 86400000).toISOString(),
        assignedTo: review.assignedTo,
    };
}

export async function GET(request: Request) {
    await sampleAdminApiDelay();
    const searchParams = getSampleAdminRouteSearchParams(request);
    const complianceReviewStatus = normalizeReviewStatusParam(
        searchParams.get("compliance_review_status"),
    );
    const accountType = searchParams.get("account_type")?.toLowerCase();
    const email = searchParams.get("email")?.toLowerCase();
    const start = searchParams.get("start");
    const end = searchParams.get("end");
    const limit = Number(searchParams.get("limit") ?? "25");
    const cursorId = searchParams.get("cursor_id");

    let reviews = SAMPLE_ADMIN_COMPLIANCE_REVIEWS.map(toApiRecord);

    if (complianceReviewStatus) {
        const reviewStatus = REVIEW_STATUS_BY_API_VALUE[complianceReviewStatus];
        reviews = reviews.filter((review) => review.complianceReviewStatus === reviewStatus);
    }

    if (accountType === "buyer" || accountType === "seller") {
        reviews = reviews.filter(
            (review) => review.accountType?.toLowerCase() === accountType,
        );
    }

    if (email) {
        reviews = reviews.filter((review) => review.email.toLowerCase().startsWith(email));
    }

    if (start || end) {
        const startTime = start ? Date.parse(start) : Number.NEGATIVE_INFINITY;
        const endTime = end ? Date.parse(end) : Number.POSITIVE_INFINITY;

        reviews = reviews.filter((review) => {
            const submittedTime = Date.parse(review.complianceUpdatedAt ?? "");
            if (Number.isNaN(submittedTime)) {
                return true;
            }

            return submittedTime >= startTime && submittedTime <= endTime;
        });
    }

    const cursorIndex = cursorId ? reviews.findIndex((review) => review.id === cursorId) + 1 : 0;
    const pageResults = reviews.slice(cursorIndex, cursorIndex + limit);
    const lastResult = pageResults.at(-1);
    const hasNext = cursorIndex + limit < reviews.length;

    return buildSampleAdminApiSuccessResponse({
        results: pageResults,
        hasNext,
        nextCursor: hasNext && lastResult
            ? {
                cursor_id: lastResult.id,
                cursor_sort_at: lastResult.complianceUpdatedAt,
            }
            : null,
    });
}
