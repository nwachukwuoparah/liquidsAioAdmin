"use client";

import React, { createContext, useContext, useState, useRef, useEffect } from "react";

const ModalContext = createContext();

export function ModalProvider({ children }) {
    const [modals, setModals] = useState([]);
    const nextId = useRef(0);

    const showModal = (content) => {
        const id = nextId.current++;
        setModals((prev) => [...prev, { id, ...content }]);
    };

    const hideModal = () => {
        setModals((prev) => prev.slice(0, -1)); // Close only the top modal
    };

    // New: Close ALL modals at once
    const hideAllModals = () => {
        setModals([]);
    };

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape" && modals.length > 0) {
                hideModal(); // Still close only top one on Escape (standard behavior)
            }
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [modals.length]);

    return (
        <ModalContext.Provider value={{
            showModal,
            hideModal,
            hideAllModals   // ← New function
        }}>
            {children}
            {modals.map(({ style = "lg:max-w-[40%]", cover, id, payload }, index) => (
                <div
                    key={id}
                    onClick={hideModal}
                    className={`modal-overlay fixed inset-0 z-[50] flex ${cover ? "" : `items-center justify-center`}`}
                    style={{
                        zIndex: 50 + index * 10,
                        backgroundColor: "rgba(0, 0, 0, 0.7)"
                    }}
                >
                    <div
                        className={`w-[90%] ${style} shadow-[0_0_12px_2px_#0000000A] inline-block ${cover ? `max-h-[100vh]` : `max-h-[90vh] bg-[#FFFFFF] rounded-[8px]`}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {payload}
                    </div>
                </div>
            ))}
        </ModalContext.Provider>
    );
}

export function useModal() {
    const context = useContext(ModalContext);

    if (!context) {
        throw new Error("useModal must be used within a ModalProvider");
    };

    return context; // Now includes { showModal, hideModal, hideAllModals }
};