import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    ModalProvider,
    normalizeShowModalInput,
    useModal,
    type ShowModalInput,
} from "./modal-provider";
import {
    MODAL_DEFAULT_PANEL_CLASS_NAME,
    MODAL_LIGHT_OVERLAY_BACKGROUND_COLOR,
    MODAL_OVERLAY_BACKGROUND_COLOR,
} from "@/lib/modal/constants/modal.constant";

function ModalTestHarness({
    onReady,
}: {
    onReady: (modalControls: ReturnType<typeof useModal>) => void;
}) {
    const modalControls = useModal();

    return (
        <button type="button" onClick={() => onReady(modalControls)}>
            expose-modal-controls
        </button>
    );
}

describe("normalizeShowModalInput", () => {
    it("maps legacy payload and style fields to the current shape", () => {
        expect(
            normalizeShowModalInput({
                payload: <span>Legacy modal</span>,
                style: "max-w-md",
                cover: true,
            }),
        ).toEqual({
            content: expect.anything(),
            panelClassName: "max-w-md",
            cover: true,
            dismissOnOverlayClick: true,
            dismissOnEscape: true,
            dimBackground: true,
            onClose: undefined,
        });
    });

    it("uses defaults for the current showModal shape", () => {
        expect(
            normalizeShowModalInput({
                content: <span>Current modal</span>,
            }),
        ).toEqual({
            content: expect.anything(),
            panelClassName: MODAL_DEFAULT_PANEL_CLASS_NAME,
            cover: false,
            dismissOnOverlayClick: true,
            dismissOnEscape: true,
            dimBackground: true,
            onClose: undefined,
        });
    });

    it("keeps an explicit dimBackground opt-out", () => {
        expect(
            normalizeShowModalInput({
                content: <span>Transparent modal</span>,
                dimBackground: false,
            }),
        ).toEqual({
            content: expect.anything(),
            panelClassName: MODAL_DEFAULT_PANEL_CLASS_NAME,
            cover: false,
            dismissOnOverlayClick: true,
            dismissOnEscape: true,
            dimBackground: false,
            onClose: undefined,
        });
    });

    it("throws when no modal content is provided", () => {
        expect(() => normalizeShowModalInput({} as ShowModalInput)).toThrow(
            "showModal requires `content` or `payload`.",
        );
    });
});

describe("ModalProvider", () => {
    beforeEach(() => {
        document.body.innerHTML = "";
        document.body.style.overflow = "";
    });

    it("renders modal content in a portal", async () => {
        let modalControls: ReturnType<typeof useModal> | null = null;

        render(
            <ModalProvider>
                <ModalTestHarness onReady={(controls) => (modalControls = controls)} />
            </ModalProvider>,
        );

        fireEvent.click(screen.getByRole("button", { name: "expose-modal-controls" }));
        modalControls!.showModal({ content: <p>Filter modal</p> });

        expect(await screen.findByText("Filter modal")).toBeInTheDocument();
        expect(document.getElementById("modal-portal-root")).toBeTruthy();
    });

    it("supports stacked modals and closes only the top layer by default", async () => {
        let modalControls: ReturnType<typeof useModal> | null = null;

        render(
            <ModalProvider>
                <ModalTestHarness onReady={(controls) => (modalControls = controls)} />
            </ModalProvider>,
        );

        fireEvent.click(screen.getByRole("button", { name: "expose-modal-controls" }));

        await act(async () => {
            modalControls!.showModal({ content: <p>First modal</p> });
            modalControls!.showModal({ content: <p>Second modal</p> });
        });

        expect(await screen.findByText("First modal")).toBeInTheDocument();
        expect(screen.getByText("Second modal")).toBeInTheDocument();
        expect(screen.getAllByRole("dialog")).toHaveLength(2);

        await act(async () => {
            modalControls!.hideModal();
        });

        await waitFor(() => {
            expect(screen.queryByText("Second modal")).not.toBeInTheDocument();
        });
        expect(screen.getByText("First modal")).toBeInTheDocument();
        expect(screen.getAllByRole("dialog")).toHaveLength(1);
    });

    it("closes every modal with hideAllModals", async () => {
        let modalControls: ReturnType<typeof useModal> | null = null;

        render(
            <ModalProvider>
                <ModalTestHarness onReady={(controls) => (modalControls = controls)} />
            </ModalProvider>,
        );

        fireEvent.click(screen.getByRole("button", { name: "expose-modal-controls" }));

        modalControls!.showModal({ content: <p>First modal</p> });
        modalControls!.showModal({ content: <p>Second modal</p> });
        modalControls!.hideAllModals();

        await waitFor(() => {
            expect(screen.queryByText("First modal")).not.toBeInTheDocument();
        });
        expect(screen.queryByText("Second modal")).not.toBeInTheDocument();
        expect(modalControls!.modalCount).toBe(0);
    });

    it("returns a close handle from showModal", async () => {
        let modalControls: ReturnType<typeof useModal> | null = null;

        render(
            <ModalProvider>
                <ModalTestHarness onReady={(controls) => (modalControls = controls)} />
            </ModalProvider>,
        );

        fireEvent.click(screen.getByRole("button", { name: "expose-modal-controls" }));

        const modalHandle = await act(async () =>
            modalControls!.showModal({
                content: (close) => (
                    <button type="button" onClick={close}>
                        close-from-content
                    </button>
                ),
            }),
        );

        await act(async () => {
            fireEvent.click(await screen.findByRole("button", { name: "close-from-content" }));
        });

        await waitFor(() => {
            expect(screen.queryByRole("button", { name: "close-from-content" })).not.toBeInTheDocument();
        });
        expect(screen.queryAllByRole("dialog")).toHaveLength(0);
        expect(modalHandle!.id).toBeGreaterThanOrEqual(0);
    });

    it("closes the top modal when Escape is pressed", async () => {
        let modalControls: ReturnType<typeof useModal> | null = null;

        render(
            <ModalProvider>
                <ModalTestHarness onReady={(controls) => (modalControls = controls)} />
            </ModalProvider>,
        );

        fireEvent.click(screen.getByRole("button", { name: "expose-modal-controls" }));
        modalControls!.showModal({ content: <p>Escapable modal</p> });

        expect(await screen.findByText("Escapable modal")).toBeInTheDocument();

        fireEvent.keyDown(window, { key: "Escape" });

        await waitFor(() => {
            expect(screen.queryByText("Escapable modal")).not.toBeInTheDocument();
        });
    });

    it("does not close on overlay click when dismissOnOverlayClick is false", async () => {
        let modalControls: ReturnType<typeof useModal> | null = null;

        render(
            <ModalProvider>
                <ModalTestHarness onReady={(controls) => (modalControls = controls)} />
            </ModalProvider>,
        );

        fireEvent.click(screen.getByRole("button", { name: "expose-modal-controls" }));

        const modalHandle = modalControls!.showModal({
            content: <p>Persistent modal</p>,
            dismissOnOverlayClick: false,
        });

        expect(await screen.findByText("Persistent modal")).toBeInTheDocument();

        fireEvent.click(screen.getByTestId(`modal-overlay-${modalHandle.id}`));

        expect(screen.getByText("Persistent modal")).toBeInTheDocument();
    });

    it("renders a lighter overlay shade when dimBackground is false", async () => {
        let modalControls: ReturnType<typeof useModal> | null = null;

        render(
            <ModalProvider>
                <ModalTestHarness onReady={(controls) => (modalControls = controls)} />
            </ModalProvider>,
        );

        fireEvent.click(screen.getByRole("button", { name: "expose-modal-controls" }));

        let dimmedHandle: { id: number } | null = null;
        let lightHandle: { id: number } | null = null;

        await act(async () => {
            dimmedHandle = modalControls!.showModal({ content: <p>Dimmed modal</p> });
            lightHandle = modalControls!.showModal({
                content: <p>Lightly shaded modal</p>,
                dimBackground: false,
            });
        });

        expect(await screen.findByText("Lightly shaded modal")).toBeInTheDocument();

        const dimmedOverlay = screen.getByTestId(`modal-overlay-${dimmedHandle!.id}`);
        const lightOverlay = screen.getByTestId(`modal-overlay-${lightHandle!.id}`);

        expect(dimmedOverlay.style.backgroundColor).toBe(MODAL_OVERLAY_BACKGROUND_COLOR);
        expect(lightOverlay.style.backgroundColor).toBe(MODAL_LIGHT_OVERLAY_BACKGROUND_COLOR);
        expect(lightOverlay.style.backgroundColor).not.toBe(dimmedOverlay.style.backgroundColor);
    });

    it("renders a full-width panel when cover is true", async () => {
        let modalControls: ReturnType<typeof useModal> | null = null;

        render(
            <ModalProvider>
                <ModalTestHarness onReady={(controls) => (modalControls = controls)} />
            </ModalProvider>,
        );

        fireEvent.click(screen.getByRole("button", { name: "expose-modal-controls" }));

        let modalHandle: { id: number } | null = null;

        await act(async () => {
            modalHandle = modalControls!.showModal({
                content: <p>Cover modal</p>,
                cover: true,
            });
        });

        expect(await screen.findByText("Cover modal")).toBeInTheDocument();

        const panel = screen.getByTestId(`modal-panel-${modalHandle!.id}`);
        expect(panel.style.width).toBe("100%");
    });

    it("locks body scroll while at least one modal is open", async () => {
        let modalControls: ReturnType<typeof useModal> | null = null;

        render(
            <ModalProvider>
                <ModalTestHarness onReady={(controls) => (modalControls = controls)} />
            </ModalProvider>,
        );

        fireEvent.click(screen.getByRole("button", { name: "expose-modal-controls" }));
        modalControls!.showModal({ content: <p>Scroll locked modal</p> });

        expect(await screen.findByText("Scroll locked modal")).toBeInTheDocument();
        expect(document.body.style.overflow).toBe("hidden");

        modalControls!.hideModal();

        await waitFor(() => {
            expect(document.body.style.overflow).toBe("");
        });
    });

    it("calls onClose when a modal is dismissed", async () => {
        let modalControls: ReturnType<typeof useModal> | null = null;
        const onClose = vi.fn();

        render(
            <ModalProvider>
                <ModalTestHarness onReady={(controls) => (modalControls = controls)} />
            </ModalProvider>,
        );

        fireEvent.click(screen.getByRole("button", { name: "expose-modal-controls" }));
        modalControls!.showModal({
            content: <p>Tracked modal</p>,
            onClose,
        });

        expect(await screen.findByText("Tracked modal")).toBeInTheDocument();
        modalControls!.hideModal();

        await waitFor(() => {
            expect(onClose).toHaveBeenCalledTimes(1);
        });
    });
});
