"use client";

import React, { useLayoutEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { FileText, BookOpen, Bell, Truck, Landmark, LucideIcon } from "lucide-react";
import { useMe } from "hooks/useMe";
import { useCompleteOnboarding } from "features/partners/hooks";
import { useToast } from "components/context/ToastContext";
import { parseApiError } from "utils/parseApiError";

interface Step {
  tourId: string;
  icon: LucideIcon;
  title: string;
  description: string;
  bg: string;
  text: string;
}

const STEPS: Step[] = [
  {
    tourId: "knowledge-hub",
    icon: BookOpen,
    title: "Knowledge Hub",
    description: "Browse programs and universities to find the right fit, with commission and tuition details up front.",
    bg: "bg-violet-50",
    text: "text-violet-600",
  },
  {
    tourId: "universities",
    icon: Landmark,
    title: "Universities",
    description: "Look up a university's campuses and intake details before recommending it to a student.",
    bg: "bg-indigo-50",
    text: "text-indigo-600",
  },
  {
    tourId: "applications",
    icon: FileText,
    title: "Applications",
    description: "Submit a new student application and track it through every stage — review, offer letter, visa, and arrival.",
    bg: "bg-blue-50",
    text: "text-blue-600",
  },
  {
    tourId: "notifications",
    icon: Bell,
    title: "Notifications",
    description: "Stay on top of application updates and messages from your account manager here.",
    bg: "bg-amber-50",
    text: "text-amber-600",
  },
  {
    tourId: "logistics-marketplace",
    icon: Truck,
    title: "Logistics Marketplace",
    description: "Connect your students with verified arrival, accommodation, and airport pickup services.",
    bg: "bg-cyan-50",
    text: "text-cyan-600",
  },
];

const DESKTOP_BREAKPOINT = 1200; // matches the sidebar's `xl` breakpoint
const GAP = 16;
const EDGE_GAP = 12;
const PADDING = 8;
const MAX_POPOVER_WIDTH = 340;
const SWIPE_THRESHOLD = 50;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(true);
  useLayoutEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= DESKTOP_BREAKPOINT);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isDesktop;
}

export default function PartnerOnboardingTour() {
  const router = useRouter();
  const { user } = useMe();
  const { showToast } = useToast();
  const { completeOnboarding, loading: completing } = useCompleteOnboarding();
  const [completed, setCompleted] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const isDesktop = useIsDesktop();

  // Mandatory: stays open until has_completed_onboarding is actually true.
  // completed is a local optimistic flag only set once the API call succeeds.
  const isActive = !completed && user?.has_completed_onboarding === false;

  const endTour = async () => {
    try {
      await completeOnboarding();
      setCompleted(true);
      router.push("/partner/knowledge-hub");
    } catch (err) {
      showToast(parseApiError(err, "Failed to complete onboarding. Please try again."), "error");
      // Tour stays open — has_completed_onboarding is still false on the backend.
    }
  };

  if (!isActive) return null;

  return isDesktop ? (
    <DesktopCoachmarkTour stepIndex={stepIndex} setStepIndex={setStepIndex} onEnd={endTour} ending={completing} />
  ) : (
    <MobileCarouselModal stepIndex={stepIndex} setStepIndex={setStepIndex} onEnd={endTour} ending={completing} />
  );
}

interface TourViewProps {
  stepIndex: number;
  setStepIndex: React.Dispatch<React.SetStateAction<number>>;
  onEnd: () => void;
  ending: boolean;
}

function DesktopCoachmarkTour({ stepIndex, setStepIndex, onEnd, ending }: TourViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [popoverSize, setPopoverSize] = useState({ width: 0, height: 0 });
  const popoverRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const stepPath = `/partner/${STEPS[stepIndex].tourId}`;
    if (pathname !== stepPath) router.push(stepPath);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex]);

  useLayoutEffect(() => {
    const measure = () => {
      const el = document.querySelector(`[data-tour-id="${STEPS[stepIndex].tourId}"]`);
      setTargetRect(el ? el.getBoundingClientRect() : null);
    };
    measure();
    // A step whose target lives inside a collapsible submenu (e.g.
    // "universities", nested under the "Knowledge Hub" accordion) only
    // finishes expanding ~300ms after this step's own navigation triggers
    // it — re-measure once after that so the spotlight lands on the fully
    // open link instead of its still-collapsing position.
    const retry = setTimeout(measure, 320);
    window.addEventListener("resize", measure);
    return () => {
      clearTimeout(retry);
      window.removeEventListener("resize", measure);
    };
  }, [stepIndex]);

  useLayoutEffect(() => {
    if (popoverRef.current) {
      setPopoverSize({ width: popoverRef.current.offsetWidth, height: popoverRef.current.offsetHeight });
    }
  }, [stepIndex, targetRect]);

  if (!targetRect) return null;

  const isLast = stepIndex === STEPS.length - 1;
  const goNext = () => (isLast ? onEnd() : setStepIndex((i) => i + 1));

  const step = STEPS[stepIndex];
  const Icon = step.icon;

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const popoverWidth = Math.min(MAX_POPOVER_WIDTH, viewportWidth - EDGE_GAP * 2);
  const popoverHeight = popoverSize.height || 220;

  const spaceRight = viewportWidth - targetRect.right - GAP;
  const placeRight = spaceRight >= popoverWidth;

  let top: number;
  let left: number;
  let arrowSide: "left" | "top" | "bottom";

  if (placeRight) {
    left = targetRect.right + GAP;
    top = clamp(targetRect.top + targetRect.height / 2 - popoverHeight / 2, EDGE_GAP, viewportHeight - popoverHeight - EDGE_GAP);
    arrowSide = "left";
  } else {
    left = clamp(targetRect.left, EDGE_GAP, viewportWidth - popoverWidth - EDGE_GAP);
    const belowTop = targetRect.bottom + GAP;
    const fitsBelow = belowTop + popoverHeight + EDGE_GAP <= viewportHeight;
    top = fitsBelow ? belowTop : targetRect.top - popoverHeight - GAP;
    arrowSide = fitsBelow ? "top" : "bottom";
  }

  const arrowOffset =
    arrowSide === "left"
      ? clamp(targetRect.top + targetRect.height / 2 - top, 24, Math.max(popoverHeight - 24, 24))
      : clamp(targetRect.left + targetRect.width / 2 - left, 24, Math.max(popoverWidth - 24, 24));

  return (
    <>
      <div className="fixed inset-0 z-[90]" />

      <div
        className="pointer-events-none fixed z-[91] rounded-lg"
        style={{
          top: targetRect.top - PADDING,
          left: targetRect.left - PADDING,
          width: targetRect.width + PADDING * 2,
          height: targetRect.height + PADDING * 2,
          boxShadow: "0 0 0 9999px rgba(15, 23, 42, 0.6)",
        }}
      />

      <div
        ref={popoverRef}
        onClick={(e) => e.stopPropagation()}
        className="fixed z-[92] rounded-xl bg-white p-5 shadow-2xl"
        style={{ top, left, width: popoverWidth }}
      >
        <div
          className="absolute h-3.5 w-3.5 rotate-45 bg-white"
          style={
            arrowSide === "left"
              ? { left: 0, top: arrowOffset, transform: "translateX(-50%) rotate(45deg)" }
              : arrowSide === "top"
              ? { top: 0, left: arrowOffset, transform: "translateY(-50%) rotate(45deg)" }
              : { bottom: 0, left: arrowOffset, transform: "translateY(50%) rotate(45deg)" }
          }
        />

        <h4 className="text-base font-semibold text-slate-900">{step.title}</h4>
        <p className="mt-1.5 text-sm text-slate-600">{step.description}</p>

        <div className="mt-5 flex items-center justify-between gap-3">
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${step.bg}`}>
            <Icon className={`h-5 w-5 ${step.text}`} />
          </div>

          <div className="flex items-center gap-1.5">
            {STEPS.map((s, i) => (
              <span key={s.tourId} className={`h-1.5 w-1.5 rounded-full transition-colors ${i === stepIndex ? "bg-blue-600" : "bg-slate-200"}`} />
            ))}
          </div>

          <button
            onClick={goNext}
            disabled={ending}
            className="shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLast ? (ending ? "Finishing..." : "Got it") : "Next"}
          </button>
        </div>
      </div>
    </>
  );
}

function MobileCarouselModal({ stepIndex, setStepIndex, onEnd, ending }: TourViewProps) {
  const touchStartX = useRef<number | null>(null);
  const isLast = stepIndex === STEPS.length - 1;

  const goNext = () => (isLast ? onEnd() : setStepIndex((i) => Math.min(i + 1, STEPS.length - 1)));
  const goBack = () => setStepIndex((i) => Math.max(i - 1, 0));

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (delta <= -SWIPE_THRESHOLD) goNext();
    else if (delta >= SWIPE_THRESHOLD && stepIndex > 0) goBack();
    touchStartX.current = null;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-overlay p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="text-base font-semibold text-slate-900">Welcome to Unibexs!</h3>
          <p className="mt-0.5 text-xs text-slate-500">Here&apos;s a quick look at what you can do.</p>
        </div>

        <div className="overflow-hidden" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          <div className="flex transition-transform duration-300 ease-in-out" style={{ transform: `translateX(-${stepIndex * 100}%)` }}>
            {STEPS.map(({ tourId, icon: Icon, title, description, bg, text }) => (
              <div key={tourId} className="w-full shrink-0 px-6 py-8">
                <div className="flex flex-col items-center text-center">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${bg}`}>
                    <Icon className={`h-7 w-7 ${text}`} />
                  </div>
                  <p className="mt-4 text-base font-semibold text-slate-900">{title}</p>
                  <p className="mt-2 text-sm text-slate-500">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-slate-200 px-5 py-4">
          <div className="flex items-center gap-1.5">
            {STEPS.map((s, i) => (
              <button
                key={s.tourId}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setStepIndex(i)}
                className={`h-1.5 rounded-full transition-all ${i === stepIndex ? "w-6 bg-blue-600" : "w-1.5 bg-slate-200"}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {stepIndex > 0 && (
              <button onClick={goBack} disabled={ending} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">
                Back
              </button>
            )}
            <button
              onClick={goNext}
              disabled={ending}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLast ? (ending ? "Finishing..." : "Got it") : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
