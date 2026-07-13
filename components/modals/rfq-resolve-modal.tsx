"use client";

import {
    ComplianceReviewCancelButton,
    ComplianceReviewDialog,
    ComplianceReviewPrimaryButton,
} from "@/components/modals/compliance-review-dialog";
import { useModal } from "@/context/modal-provider";
import { useAdminRfqResolve } from "@/lib/admin/hooks/use-admin-rfqs";

interface RfqResolveModalProps {
    rfqId: string;
    buyerName?: string;
}

/** Confirms marking a pending buyer RFQ as resolved. */
export default function RfqResolveModal({ rfqId, buyerName }: RfqResolveModalProps) {
    const { closeModal } = useModal();
    const resolveRfq = useAdminRfqResolve();

    const handleResolve = () => {
        if (resolveRfq.isPending) {
            return;
        }

        resolveRfq.mutate(rfqId, {
            onSuccess: () => closeModal(),
        });
    };

    return (
        <ComplianceReviewDialog
            title="Mark as resolved?"
            description={
                buyerName
                    ? `Mark the request from ${buyerName} as resolved? Use this when the request has been fulfilled or the buyer has been attended to.`
                    : "Mark this request as resolved? Use this when the request has been fulfilled or the buyer has been attended to."
            }
            actions={
                <>
                    <ComplianceReviewCancelButton disabled={resolveRfq.isPending} />
                    <ComplianceReviewPrimaryButton
                        label={resolveRfq.isPending ? "Please wait…" : "Yes, mark as resolved"}
                        tone="approve"
                        disabled={resolveRfq.isPending}
                        onClick={handleResolve}
                    />
                </>
            }
        />
    );
}
