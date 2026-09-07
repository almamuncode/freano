"use client";

import { useEffect, useState } from "react";

const keys = [
  { label: "C", value: "clear", style: "muted" },
  { label: "⌫", value: "backspace", style: "muted" },
  { label: "±", value: "sign", style: "muted" },
  { label: "÷", value: "÷", style: "operator" },
  { label: "7", value: "7", style: "number" },
  { label: "8", value: "8", style: "number" },
  { label: "9", value: "9", style: "number" },
  { label: "×", value: "×", style: "operator" },
  { label: "4", value: "4", style: "number" },
  { label: "5", value: "5", style: "number" },
  { label: "6", value: "6", style: "number" },
  { label: "−", value: "-", style: "operator" },
  { label: "1", value: "1", style: "number" },
  { label: "2", value: "2", style: "number" },
  { label: "3", value: "3", style: "number" },
  { label: "+", value: "+", style: "operator" },
  { label: "0", value: "0", style: "number wide" },
  { label: ".", value: ".", style: "number" },
  { label: "=", value: "equals", style: "equals" },
] as const;

function calculateExpression(expression: string) {
  const match = expression.match(/^(-?\d*\.?\d+)([+\-×÷])(-?\d*\.?\d+)$/);
  if (!match) return null;

  const first = Number(match[1]);
  const second = Number(match[3]);
  if (match[2] === "+") return first + second;
  if (match[2] === "-") return first - second;
  if (match[2] === "×") return first * second;
  return second === 0 ? null : first / second;
}

export default function QuickCalculator() {
  const [display, setDisplay] = useState("0");
  const [justCalculated, setJustCalculated] = useState(false);

  function pressKey(value: string) {
    if (value === "clear") {
      setDisplay("0");
      setJustCalculated(false);
      return;
    }

    if (value === "backspace") {
      setDisplay((current) => current.length > 1 ? current.slice(0, -1) : "0");
      setJustCalculated(false);
      return;
    }

    if (value === "sign") {
      setDisplay((current) => current.startsWith("-") ? current.slice(1) : current === "0" ? current : `-${current}`);
      setJustCalculated(false);
      return;
    }

    if (value === "equals") {
      const result = calculateExpression(display);
      if (result !== null) {
        setDisplay(result.toLocaleString("en-BD", { maximumFractionDigits: 8, useGrouping: false }));
        setJustCalculated(true);
      }
      return;
    }

    if (/\d/.test(value)) {
      setDisplay((current) => justCalculated || current === "0" ? value : current + value);
      setJustCalculated(false);
      return;
    }

    if (value === ".") {
      setDisplay((current) => {
        const currentNumber = current.split(/[+\-×÷]/).pop() ?? "";
        return currentNumber.includes(".") ? current : current + ".";
      });
      setJustCalculated(false);
      return;
    }

    if (["+", "-", "×", "÷"].includes(value)) {
      setDisplay((current) => {
        if (justCalculated) return current + value;
        if (/[+\-×÷]$/.test(current)) return current.slice(0, -1) + value;
        return current + value;
      });
      setJustCalculated(false);
    }
  }

  useEffect(() => {
    function handleKeyboard(event: KeyboardEvent) {
      if (/^\d$/.test(event.key) || [".", "+", "-"].includes(event.key)) pressKey(event.key);
      else if (event.key === "*" || event.key.toLowerCase() === "x") pressKey("×");
      else if (event.key === "/") pressKey("÷");
      else if (event.key === "Enter" || event.key === "=") pressKey("equals");
      else if (event.key === "Backspace") pressKey("backspace");
      else if (event.key === "Escape") pressKey("clear");
      else return;
      event.preventDefault();
    }

    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  });

  return (
    <div className="mt-6 border-t border-hairline pt-5">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-ink">Quick calculator</h3>
          <p className="mt-0.5 text-xs text-ink/55">A handy total before you record it.</p>
        </div>
      </div>
      <div className="overflow-hidden rounded-xl bg-[#20293A] p-2.5 shadow-inner">
        <div className="mb-2 flex h-12 items-center justify-end overflow-hidden rounded-lg bg-[#111827] px-3 text-2xl font-semibold tracking-tight text-white" aria-live="polite">
          {display}
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {keys.map((key) => (
            <button
              key={key.value}
              type="button"
              onClick={() => pressKey(key.value)}
              className={`h-9 rounded-lg text-sm font-semibold transition active:scale-95 ${key.style.includes("wide") ? "col-span-2" : ""} ${
                key.style === "operator" ? "bg-brand text-white hover:bg-brand-dark" :
                  key.style === "equals" ? "bg-income text-white hover:bg-green-700" :
                    key.style === "muted" ? "bg-gray-500/30 text-gray-200 hover:bg-gray-500/50" :
                      "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {key.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
