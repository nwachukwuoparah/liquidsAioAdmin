import { describe, expect, it } from "vitest";
import { getAdminRfqResolvePath } from "@/lib/rfq/constants/admin-rfqs-api.constant";

describe("getAdminRfqResolvePath", () => {
    it("builds POST /rfqs/{id}/resolve", () => {
        expect(getAdminRfqResolvePath("rfq-1")).toBe("/rfqs/rfq-1/resolve");
    });

    it("encodes the RFQ id in the path", () => {
        expect(getAdminRfqResolvePath("rfq/with spaces")).toBe(
            "/rfqs/rfq%2Fwith%20spaces/resolve",
        );
    });
});
