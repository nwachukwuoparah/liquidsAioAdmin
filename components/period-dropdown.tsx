"use client";

import Typography from "@/components/typography";
import { ChevronDownIcon } from "@/components/vector";
import { useEffect, useRef, useState } from "react";

const PERIOD_OPTIONS = ["This month", "This week", "Today", "This year"] as const;

export type PeriodOption = (typeof PERIOD_OPTIONS)[number];

interface PeriodDropdownProps {
  value: PeriodOption;
  onChange: (value: PeriodOption) => void;
}

export default function PeriodDropdown({ value, onChange }: PeriodDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="flex items-center gap-1.5 rounded-lg px-2 py-1 transition-colors hover:bg-slate-100"
      >
        <Typography type="text16" fontWeight={600} className="text-[#0B0E05]">
          {value}
        </Typography>
        <ChevronDownIcon
          className={`h-[6px] w-[11px] shrink-0 text-[#0B0E05] transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-1.5 min-w-[9rem] rounded-xl border border-[#0B0E0514] bg-[#FFFFFF] p-1 shadow-card ring-1 ring-black/5">
          {PERIOD_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors ${
                option === value ? "bg-slate-50" : "hover:bg-slate-50"
              }`}
            >
              <Typography
                type="text14"
                fontWeight={option === value ? 600 : 500}
                className={option === value ? "text-[#0B0E05]" : "text-slate-600"}
              >
                {option}
              </Typography>
              {option === value && <div className="h-1.5 w-1.5 rounded-full bg-[#518300]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
