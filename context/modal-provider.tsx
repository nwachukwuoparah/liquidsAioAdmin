"use client";

import {
    MODAL_BASE_Z_INDEX,
    MODAL_DEFAULT_PANEL_CLASS_NAME,
    MODAL_LIGHT_OVERLAY_BACKGROUND_COLOR,
    MODAL_OVERLAY_BACKGROUND_COLOR,
    MODAL_PANEL_MAX_HEIGHT_PERCENT,
    MODAL_PANEL_WIDTH_PERCENT,
    MODAL_PORTAL_ELEMENT_ID,
    MODAL_STACK_Z_INDEX_STEP,
} from "@/lib/modal/constants/modal.constant";
import {
    createContext,
    memo,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useReducer,
    useRef,
    useState,
    type ReactNode,
} from "react";
import { createPortal } from "react-dom";

/** Modal body content or a render prop that receives a close handler. */
export type ModalContent = ReactNode | ((closeModal: () => void) => ReactNode);

export interface ShowModalOptions {
    /** Modal body content or render prop receiving a close handler. */
    content: ModalContent;
    /** Tailwind classes for the modal panel width and layout. */
    panelClassName?: string;
    /** When true, the modal covers the full viewport without centering. */
    cover?: boolean;
    /** Close when clicking the overlay. Default: true. */
    dismissOnOverlayClick?: boolean;
    /** Close when pressing Escape. Default: true for the topmost modal only. */
    dismissOnEscape?: boolean;
    /**
     * When false, this modal uses a lighter overlay shade instead of the full
     * dark backdrop, so stacking it on top of another modal only adds a subtle
     * tint rather than darkening the parent further. Default: true.
     */
    dimBackground?: boolean;
    /** Called after the modal is removed from the stack. */
    onClose?: () => void;
}

/** Legacy modal open shape kept for existing call sites. */
export interface LegacyShowModalInput {
    payload?: ModalContent;
    style?: string;
    cover?: boolean;
    dismissOnOverlayClick?: boolean;
    dismissOnEscape?: boolean;
    dimBackground?: boolean;
    onClose?: () => void;
}

export type ShowModalInput = ShowModalOptions | (LegacyShowModalInput & { content?: ModalContent });

export interface ModalHandle {
    id: number;
    close: () => void;
}

export interface ModalContextValue {
    /** Opens a modal and returns its id plus a dedicated close function. */
    showModal: (input: ShowModalInput) => ModalHandle;
    /** Closes the topmost modal in the stack. */
    hideModal: () => void;
    /** Alias for hideModal. */
    closeModal: () => void;
    /** Closes the target modal and any modals opened above it. */
    closeModalById: (modalId: number) => void;
    /** Closes every open modal. */
    hideAllModals: () => void;
    /** Number of currently open modals. */
    modalCount: number;
}

interface ModalInstance {
    id: number;
    content: ModalContent;
    panelClassName: string;
    cover: boolean;
    dismissOnOverlayClick: boolean;
    dismissOnEscape: boolean;
    dimBackground: boolean;
    onClose?: () => void;
}

type ModalAction =
    | { type: "PUSH"; modal: ModalInstance }
    | { type: "POP" }
    | { type: "REMOVE"; modalId: number }
    | { type: "CLEAR" };

const ModalContext = createContext<ModalContextValue | null>(null);

function isLegacyShowModalInput(input: ShowModalInput): input is LegacyShowModalInput {
    return "payload" in input || ("style" in input && !("content" in input));
}

/** Normalizes legacy and current modal open payloads into one shape. */
export function normalizeShowModalInput(input: ShowModalInput): Omit<ModalInstance, "id"> {
    if (isLegacyShowModalInput(input)) {
        const legacyInput = input;

        if (!legacyInput.payload && !("content" in legacyInput)) {
            throw new Error("showModal requires `content` or `payload`.");
        }

        return {
            content: legacyInput.payload ?? (legacyInput as ShowModalOptions).content,
            panelClassName: legacyInput.style ?? MODAL_DEFAULT_PANEL_CLASS_NAME,
            cover: legacyInput.cover ?? false,
            dismissOnOverlayClick: legacyInput.dismissOnOverlayClick ?? true,
            dismissOnEscape: legacyInput.dismissOnEscape ?? true,
            dimBackground: legacyInput.dimBackground ?? true,
            onClose: legacyInput.onClose,
        };
    }

    if (!input.content) {
        throw new Error("showModal requires `content` or `payload`.");
    }

    return {
        content: input.content,
        panelClassName: input.panelClassName ?? MODAL_DEFAULT_PANEL_CLASS_NAME,
        cover: input.cover ?? false,
        dismissOnOverlayClick: input.dismissOnOverlayClick ?? true,
        dismissOnEscape: input.dismissOnEscape ?? true,
        dimBackground: input.dimBackground ?? true,
        onClose: input.onClose,
    };
}

function modalStackReducer(modalStack: ModalInstance[], action: ModalAction): ModalInstance[] {
    switch (action.type) {
        case "PUSH":
            return [...modalStack, action.modal];
        case "POP": {
            if (modalStack.length === 0) {
                return modalStack;
            }

            const topModal = modalStack[modalStack.length - 1];
            topModal.onClose?.();
            return modalStack.slice(0, -1);
        }
        case "REMOVE": {
            const modalIndex = modalStack.findIndex((modal) => modal.id === action.modalId);

            if (modalIndex === -1) {
                return modalStack;
            }

            const removedModals = modalStack.slice(modalIndex);
            removedModals.forEach((modal) => modal.onClose?.());
            return modalStack.slice(0, modalIndex);
        }
        case "CLEAR": {
            modalStack.forEach((modal) => modal.onClose?.());
            return [];
        }
        default:
            return modalStack;
    }
}

function renderModalContent(content: ModalContent, closeModal: () => void): ReactNode {
    return typeof content === "function" ? content(closeModal) : content;
}

interface ModalLayerProps {
    modal: ModalInstance;
    stackIndex: number;
    isTopModal: boolean;
    onRequestClose: () => void;
}

const ModalLayer = memo(function ModalLayer({
    modal,
    stackIndex,
    isTopModal,
    onRequestClose,
}: ModalLayerProps) {
    const closeCurrentModal = useCallback(() => {
        onRequestClose();
    }, [onRequestClose]);

    const handleOverlayClick = useCallback(() => {
        if (!isTopModal || !modal.dismissOnOverlayClick) {
            return;
        }

        closeCurrentModal();
    }, [closeCurrentModal, isTopModal, modal.dismissOnOverlayClick]);

    const layerZIndex = MODAL_BASE_Z_INDEX + stackIndex * MODAL_STACK_Z_INDEX_STEP;

    return (
        <div
            role="presentation"
            data-testid={`modal-overlay-${modal.id}`}
            onClick={handleOverlayClick}
            className={`modal-overlay fixed inset-0 flex ${modal.cover ? "" : "items-center justify-center"} ${isTopModal ? "" : "pointer-events-none"}`}
            style={{
                zIndex: layerZIndex,
                backgroundColor: modal.dimBackground
                    ? MODAL_OVERLAY_BACKGROUND_COLOR
                    : MODAL_LIGHT_OVERLAY_BACKGROUND_COLOR,
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                data-testid={`modal-panel-${modal.id}`}
                className={`${modal.cover ? "block h-full w-full" : "inline-block"} shadow-[0_0_12px_2px_#0000000A] ${modal.panelClassName} ${modal.cover ? "max-h-[100vh]" : "rounded-[8px] bg-[#FFFFFF]"
                    }`}
                style={{
                    width: modal.cover ? "100%" : `${MODAL_PANEL_WIDTH_PERCENT}%`,
                    maxHeight: modal.cover ? undefined : `${MODAL_PANEL_MAX_HEIGHT_PERCENT}vh`,
                }}
                onClick={(event) => event.stopPropagation()}
            >
                {renderModalContent(modal.content, closeCurrentModal)}
            </div>
        </div>
    );
});

interface ModalPortalProps {
    modalStack: ModalInstance[];
    onCloseModalById: (modalId: number) => void;
}

function ModalPortal({ modalStack, onCloseModalById }: ModalPortalProps) {
    const [portalElement, setPortalElement] = useState<HTMLElement | null>(null);

    useEffect(() => {
        let modalPortalRoot = document.getElementById(MODAL_PORTAL_ELEMENT_ID);

        if (!modalPortalRoot) {
            modalPortalRoot = document.createElement("div");
            modalPortalRoot.id = MODAL_PORTAL_ELEMENT_ID;
            document.body.appendChild(modalPortalRoot);
        }

        setPortalElement(modalPortalRoot);
    }, []);

    if (!portalElement || modalStack.length === 0) {
        return null;
    }

    const topModalId = modalStack[modalStack.length - 1]?.id;

    return createPortal(
        <>
            {modalStack.map((modal, stackIndex) => (
                <ModalLayer
                    key={modal.id}
                    modal={modal}
                    stackIndex={stackIndex}
                    isTopModal={modal.id === topModalId}
                    onRequestClose={() => onCloseModalById(modal.id)}
                />
            ))}
        </>,
        portalElement,
    );
}

export function ModalProvider({ children }: { children: ReactNode }) {
    const [modalStack, dispatchModalAction] = useReducer(modalStackReducer, []);
    const nextModalIdRef = useRef(0);

    const hideModal = useCallback(() => {
        dispatchModalAction({ type: "POP" });
    }, []);

    const closeModalById = useCallback((modalId: number) => {
        dispatchModalAction({ type: "REMOVE", modalId });
    }, []);

    const hideAllModals = useCallback(() => {
        dispatchModalAction({ type: "CLEAR" });
    }, []);

    const showModal = useCallback(
        (input: ShowModalInput): ModalHandle => {
            const normalizedModal = normalizeShowModalInput(input);
            const modalId = nextModalIdRef.current++;

            dispatchModalAction({
                type: "PUSH",
                modal: {
                    id: modalId,
                    ...normalizedModal,
                },
            });

            return {
                id: modalId,
                close: () => closeModalById(modalId),
            };
        },
        [closeModalById],
    );

    useEffect(() => {
        if (modalStack.length === 0) {
            return;
        }

        const previousBodyOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previousBodyOverflow;
        };
    }, [modalStack.length]);

    useEffect(() => {
        const topModal = modalStack[modalStack.length - 1];

        if (!topModal?.dismissOnEscape) {
            return;
        }

        const handleEscapeKey = (keyboardEvent: KeyboardEvent) => {
            if (keyboardEvent.key !== "Escape") {
                return;
            }

            hideModal();
        };

        window.addEventListener("keydown", handleEscapeKey);
        return () => window.removeEventListener("keydown", handleEscapeKey);
    }, [hideModal, modalStack]);

    const contextValue = useMemo<ModalContextValue>(
        () => ({
            showModal,
            hideModal,
            closeModal: hideModal,
            closeModalById,
            hideAllModals,
            modalCount: modalStack.length,
        }),
        [closeModalById, hideAllModals, hideModal, modalStack.length, showModal],
    );

    return (
        <ModalContext.Provider value={contextValue}>
            {children}
            <ModalPortal modalStack={modalStack} onCloseModalById={closeModalById} />
        </ModalContext.Provider>
    );
}

/** Returns modal stack controls. Must be used within ModalProvider. */
export function useModal(): ModalContextValue {
    const modalContext = useContext(ModalContext);

    if (!modalContext) {
        throw new Error("useModal must be used within a ModalProvider");
    }

    return modalContext;
}
