import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import LotImagesModal from "./lot-images-modal";

const closeModalMock = vi.fn();

vi.mock("@/context/modal-provider", () => ({
    useModal: () => ({
        closeModal: closeModalMock,
        showModal: vi.fn(),
    }),
}));

const images = [
    { url: "https://example.com/lot-1.jpg" },
    { url: "https://example.com/lot-2.jpg" },
    { url: "https://example.com/lot-3.jpg" },
];

describe("LotImagesModal", () => {
    it("shows the image at the initial index with a count and thumbnails", () => {
        render(<LotImagesModal images={images} title="Sample lot" initialIndex={1} />);

        expect(screen.getByText("Sample lot")).toBeInTheDocument();
        expect(screen.getByText("(2/3)")).toBeInTheDocument();
        expect(screen.getByTestId("lot-images-active")).toHaveAttribute("src", images[1].url);
        expect(screen.getAllByTestId("lot-images-thumb")).toHaveLength(3);
    });

    it("navigates to the next image and wraps around", () => {
        render(<LotImagesModal images={images} initialIndex={2} />);

        expect(screen.getByTestId("lot-images-active")).toHaveAttribute("src", images[2].url);

        fireEvent.click(screen.getByLabelText("Next image"));

        expect(screen.getByTestId("lot-images-active")).toHaveAttribute("src", images[0].url);
        expect(screen.getByText("(1/3)")).toBeInTheDocument();
    });

    it("navigates to the previous image and wraps to the last", () => {
        render(<LotImagesModal images={images} initialIndex={0} />);

        fireEvent.click(screen.getByLabelText("Previous image"));

        expect(screen.getByTestId("lot-images-active")).toHaveAttribute("src", images[2].url);
    });

    it("jumps to an image when its thumbnail is clicked", () => {
        render(<LotImagesModal images={images} />);

        fireEvent.click(screen.getByLabelText("View image 3"));

        expect(screen.getByTestId("lot-images-active")).toHaveAttribute("src", images[2].url);
    });

    it("clamps an out-of-range initial index", () => {
        render(<LotImagesModal images={images} initialIndex={99} />);

        expect(screen.getByTestId("lot-images-active")).toHaveAttribute("src", images[2].url);
    });

    it("renders an empty state and hides navigation with no images", () => {
        render(<LotImagesModal images={[]} />);

        expect(screen.getByText("No images available")).toBeInTheDocument();
        expect(screen.queryByLabelText("Next image")).not.toBeInTheDocument();
        expect(screen.queryByTestId("lot-images-thumb")).not.toBeInTheDocument();
    });

    it("closes when the close button is clicked", () => {
        render(<LotImagesModal images={images} />);

        fireEvent.click(screen.getByLabelText("Close dialog"));

        expect(closeModalMock).toHaveBeenCalledTimes(1);
    });
});
