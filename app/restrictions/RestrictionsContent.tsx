"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { colors } from "@/lib/tokens";
import type { RestrictionType, GuidelineRule, Granularity } from "@/lib/types";
import { HOTEL_GROUPS, SEGMENTS, ROOM_TYPES, MOCK_SUB_RATES, MOCK_PROPERTIES_BY_GROUP } from "@/lib/data";
import { useRestrictions } from "@/lib/restrictions-context";
import Select from "@/components/Select";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function restrictionSummary(restrictions: GuidelineRule["restrictions"]): string {
  const labels: Record<RestrictionType, string> = {
    CTS: "Closed to Stay",
    CTA: "Closed to Arrival",
    CTD: "Closed to Departure",
    MinSA: "Min Stay Arrival",
    MinST: "Min Stay Thru",
    MaxSA: "Max Stay Arrival",
    MaxST: "Max Stay Thru",
  };
  return restrictions
    .map((r) => {
      const label = labels[r.type];
      return r.value !== undefined ? `${label} ${r.value}` : label;
    })
    .join(", ");
}

function inferGranularity(rule: GuidelineRule): Granularity {
  return rule.granularity ?? (rule.segment === "Property" ? "property" : "segment");
}

function getSubGroupKey(rule: GuidelineRule): string {
  const g = inferGranularity(rule);
  if (g === "property") return "Property";
  if (g === "roomtype") return rule.roomType;
  return rule.segment;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 13H13v6h-2v-6H5v-2h6V5h2v6h6v2z" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={colors.textSecondary}>
      <path d="M16 1H4C2.9 1 2 1.9 2 3v14h2V3h12V1zm3 4H8C6.9 5 6 5.9 6 7v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={colors.textSecondary}>
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={colors.textSecondary}>
      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M5 20h14v-2H5v2zM19 9h-4V3H9v6H5l7 7 7-7z" />
    </svg>
  );
}

function ChevronDownIcon({ rotated }: { rotated?: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      style={{
        transform: rotated ? "rotate(-90deg)" : "rotate(0deg)",
        transition: "transform 150ms",
        display: "block",
      }}
    >
      <path d="M7 10l5 5 5-5H7z" />
    </svg>
  );
}

function DragHandleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
    </svg>
  );
}

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors"
      style={{ backgroundColor: active ? colors.primary : colors.border }}
    >
      <span
        className="inline-block h-4 w-4 rounded-full bg-white shadow transition-transform mt-0.5"
        style={{ transform: active ? "translateX(18px)" : "translateX(2px)" }}
      />
    </button>
  );
}

// ─── Section dividers ─────────────────────────────────────────────────────────

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className="flex-1 h-px" style={{ backgroundColor: colors.border }} />
      <span
        className="text-[11px] font-bold uppercase tracking-widest px-2"
        style={{ color: colors.textDisabled }}
      >
        {label}
      </span>
      <div className="flex-1 h-px" style={{ backgroundColor: colors.border }} />
    </div>
  );
}

// Left-aligned label with trailing line — for individual segment/roomtype zones within a group
function SubSectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 mt-4 mb-2">
      <span className="text-[11px] font-semibold uppercase tracking-wide shrink-0" style={{ color: colors.textSecondary }}>
        {label}
      </span>
      <div className="flex-1 h-px" style={{ backgroundColor: colors.border }} />
    </div>
  );
}

// Minimal hotel group label — used in granularity view to show which group the following sub-sections belong to
function HotelGroupLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 mt-5 mb-1">
      <span className="text-[12px] font-semibold" style={{ color: colors.textSecondary }}>
        {label}
      </span>
    </div>
  );
}

// ─── Info tooltip ─────────────────────────────────────────────────────────────

function InfoTooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill={colors.textDisabled} style={{ cursor: "default" }}>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
      </svg>
      {show && (
        <div
          className="absolute left-6 top-0 z-50 rounded shadow-lg px-3 py-2 text-[12px] leading-relaxed"
          style={{ backgroundColor: colors.textPrimary, color: colors.white, width: "280px", pointerEvents: "none" }}
        >
          {text}
        </div>
      )}
    </div>
  );
}

// ─── Collapsible filter section ───────────────────────────────────────────────

function FilterSection({
  label,
  sectionKey,
  collapsed,
  onToggle,
  children,
}: {
  label: string;
  sectionKey: string;
  collapsed: boolean;
  onToggle: (key: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <button
        onClick={() => onToggle(sectionKey)}
        className="flex items-center justify-between w-full mb-1.5"
      >
        <span className="text-base font-medium" style={{ color: colors.textSecondary }}>
          {label}
        </span>
        <span style={{ color: colors.textSecondary }}>
          <ChevronDownIcon rotated={collapsed} />
        </span>
      </button>
      {!collapsed && children}
    </div>
  );
}

// ─── Granularity chip colors ──────────────────────────────────────────────────

const GRANULARITY_COLORS: Record<string, { bg: string; text: string }> = {
  property: { bg: colors.chipGranPropertyBg, text: colors.chipGranPropertyText },
  segment:  { bg: colors.chipGranSegmentBg,  text: colors.chipGranSegmentText },
  subrate:  { bg: colors.chipGranSubrateBg,  text: colors.chipGranSubrateText },
  roomtype: { bg: colors.chipGranRoomtypeBg, text: colors.chipGranRoomtypeText },
};

// ─── Main export ──────────────────────────────────────────────────────────────

const ALL_SEGMENTS_SUBRATES = [...SEGMENTS, ...MOCK_SUB_RATES];

type SortBy = "group" | "granularity";

export default function RestrictionsContent() {
  const { rules, ruleStates, toggleRule, toast, clearToast, reorderRulesInGroup } = useRestrictions();
  const [selectedGroups, setSelectedGroups] = useState<string[]>(HOTEL_GROUPS);
  const [sortBy, setSortBy] = useState<SortBy>("group");
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [propertySelected, setPropertySelected] = useState(true);
  const [activeSegmentsSubrates, setActiveSegmentsSubrates] = useState<string[]>(ALL_SEGMENTS_SUBRATES);
  const [activeRoomTypes, setActiveRoomTypes] = useState<string[]>(ROOM_TYPES);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  // DnD state
  const [dragging, setDragging] = useState<{ id: string; droppableId: string } | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(clearToast, 3000);
    return () => clearTimeout(t);
  }, [toast, clearToast]);

  function toggleSection(key: string) {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  function toggleGroup(group: string) {
    setSelectedGroups((prev) => {
      if (prev.includes(group)) {
        if (prev.length === 1) return prev;
        return prev.filter((g) => g !== group);
      }
      return [...prev, group];
    });
  }

  function toggleSegmentSubrate(item: string) {
    setActiveSegmentsSubrates((prev) =>
      prev.includes(item) ? prev.filter((s) => s !== item) : [...prev, item]
    );
  }

  function toggleRoomType(rt: string) {
    setActiveRoomTypes((prev) =>
      prev.includes(rt) ? prev.filter((r) => r !== rt) : [...prev, rt]
    );
  }

  const visibleRules = rules.filter((r) => selectedGroups.includes(r.hotelGroup));

  function statusOk(rule: GuidelineRule) {
    if (statusFilter === "active") return !!ruleStates[rule.id];
    if (statusFilter === "inactive") return !ruleStates[rule.id];
    return true;
  }

  const propertyRules = visibleRules.filter(
    (r) => inferGranularity(r) === "property" && propertySelected && statusOk(r)
  );

  const filteredSegmentRules = visibleRules.filter((r) => {
    const g = inferGranularity(r);
    if (g === "property") return false;
    if (g === "roomtype") return activeRoomTypes.includes(r.roomType) && statusOk(r);
    return activeSegmentsSubrates.includes(r.segment) && statusOk(r);
  });

  const segmentSubrateCounts = ALL_SEGMENTS_SUBRATES.reduce<Record<string, number>>((acc, item) => {
    acc[item] = visibleRules.filter((r) => {
      const g = inferGranularity(r);
      if (g !== "segment" && g !== "subrate") return false;
      return r.segment === item;
    }).length;
    return acc;
  }, {});

  const roomTypeCounts = ROOM_TYPES.reduce<Record<string, number>>((acc, rt) => {
    acc[rt] = visibleRules.filter((r) => {
      if (inferGranularity(r) !== "roomtype") return false;
      return r.roomType === rt;
    }).length;
    return acc;
  }, {});

  const hasAnyContent = propertyRules.length > 0 || filteredSegmentRules.length > 0;

  // ─── Drag-and-drop ─────────────────────────────────────────────────────────

  function handleDragStart(ruleId: string, droppableId: string, e: React.DragEvent) {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", ruleId);
    // Small delay so the ghost image captures the original card, not the faded one
    requestAnimationFrame(() => setDragging({ id: ruleId, droppableId }));
  }

  function handleDragOver(e: React.DragEvent, ruleId: string, currentDroppableId: string) {
    e.preventDefault();
    if (!dragging || dragging.droppableId !== currentDroppableId) {
      e.dataTransfer.dropEffect = "none";
      return;
    }
    e.dataTransfer.dropEffect = "move";
    if (dragOverId !== ruleId) setDragOverId(ruleId);
  }

  function handleDrop(e: React.DragEvent, targetRuleId: string, groupIds: string[], currentDroppableId: string) {
    e.preventDefault();
    if (!dragging || dragging.droppableId !== currentDroppableId) return;
    const draggedId = dragging.id;
    if (draggedId === targetRuleId) { setDragging(null); setDragOverId(null); return; }
    const newOrder = [...groupIds];
    const fromIdx = newOrder.indexOf(draggedId);
    const toIdx = newOrder.indexOf(targetRuleId);
    if (fromIdx !== -1 && toIdx !== -1) {
      newOrder.splice(fromIdx, 1);
      newOrder.splice(toIdx, 0, draggedId);
      reorderRulesInGroup(newOrder);
    }
    setDragging(null);
    setDragOverId(null);
  }

  function handleDragEnd() {
    setDragging(null);
    setDragOverId(null);
  }

  function renderSubGroup(droppableId: string, groupRules: GuidelineRule[]) {
    const groupIds = groupRules.map((r) => r.id);
    return (
      <div
        className="flex flex-col gap-3"
        onDragOver={(e) => { if (dragging?.droppableId === droppableId) e.preventDefault(); }}
        onDrop={(e) => {
          e.preventDefault();
          if (!dragging || dragging.droppableId !== droppableId || dragOverId) return;
          const newOrder = [...groupIds];
          const fromIdx = newOrder.indexOf(dragging.id);
          if (fromIdx !== -1) {
            newOrder.splice(fromIdx, 1);
            newOrder.push(dragging.id);
            reorderRulesInGroup(newOrder);
          }
          setDragging(null);
          setDragOverId(null);
        }}
      >
        {groupRules.map((rule) => {
          const isBeingDragged = dragging?.id === rule.id;
          const isDropTarget = dragOverId === rule.id && dragging?.id !== rule.id && dragging?.droppableId === droppableId;
          return (
            <div
              key={rule.id}
              draggable
              onDragStart={(e) => handleDragStart(rule.id, droppableId, e)}
              onDragOver={(e) => handleDragOver(e, rule.id, droppableId)}
              onDrop={(e) => handleDrop(e, rule.id, groupIds, droppableId)}
              onDragEnd={handleDragEnd}
              style={{
                opacity: isBeingDragged ? 0.45 : 1,
                paddingTop: isDropTarget ? "2px" : undefined,
                borderTop: isDropTarget ? `2px solid ${colors.primary}` : "2px solid transparent",
                transition: "border-top-color 80ms, opacity 80ms",
                cursor: "grab",
              }}
            >
              <GuidelineCard
                rule={rule}
                active={ruleStates[rule.id]}
                onToggle={() => toggleRule(rule.id)}
              />
            </div>
          );
        })}
      </div>
    );
  }

  // ─── Render helpers ────────────────────────────────────────────────────────

  function computeSubGroups(groupRules: GuidelineRule[]): Map<string, GuidelineRule[]> {
    const map = new Map<string, GuidelineRule[]>();
    for (const rule of groupRules) {
      const key = getSubGroupKey(rule);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(rule);
    }
    return map;
  }

  function renderByGroup() {
    return (
      <>
        {HOTEL_GROUPS.filter((g) => selectedGroups.includes(g)).map((group) => {
          const groupRules = [
            ...propertyRules.filter((r) => r.hotelGroup === group),
            ...filteredSegmentRules.filter((r) => r.hotelGroup === group),
          ];
          if (groupRules.length === 0) return null;
          const subGroups = computeSubGroups(groupRules);
          return (
            <div key={group} className="mb-8">
              <SectionDivider label={group} />
              <div className="flex flex-col">
                {Array.from(subGroups.entries()).map(([key, keyRules]) => (
                  <div key={key}>
                    <SubSectionDivider label={key} />
                    {renderSubGroup(`grp|${group}|${key}`, keyRules)}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </>
    );
  }

  // renderByGranularity: two levels only.
  // Level 1 (SectionDivider): the individual value — "Property", "OTA - Transient", "Suite", etc.
  // Level 2 (SubSectionDivider): hotel group — only shown when more than one group is visible.
  function renderByGranularity() {
    const activeGroups = HOTEL_GROUPS.filter((g) => selectedGroups.includes(g));
    const showGroupLabel = activeGroups.length > 1;

    // Ordered list of unique subgroup keys, preserving meaningful hierarchy:
    // Property → segment names → subrate names → room type names
    const orderedKeys: { key: string; rules: GuidelineRule[] }[] = [];

    function collectKey(key: string, rules: GuidelineRule[]) {
      if (rules.length > 0) orderedKeys.push({ key, rules });
    }

    // Property
    collectKey("Property", propertyRules);

    // Segments — in the canonical SEGMENTS order, then any extras from the data
    const segmentRules = filteredSegmentRules.filter((r) => inferGranularity(r) === "segment");
    const seenSegments = new Set<string>();
    for (const seg of [...SEGMENTS, ...segmentRules.map((r) => r.segment)]) {
      if (seenSegments.has(seg)) continue;
      seenSegments.add(seg);
      collectKey(seg, segmentRules.filter((r) => r.segment === seg));
    }

    // Sub rates
    const subrateRules = filteredSegmentRules.filter((r) => inferGranularity(r) === "subrate");
    const seenSubrates = new Set<string>();
    for (const sr of [...MOCK_SUB_RATES, ...subrateRules.map((r) => r.segment)]) {
      if (seenSubrates.has(sr)) continue;
      seenSubrates.add(sr);
      collectKey(sr, subrateRules.filter((r) => r.segment === sr));
    }

    // Room types
    const roomTypeRules = filteredSegmentRules.filter((r) => inferGranularity(r) === "roomtype");
    const seenRoomTypes = new Set<string>();
    for (const rt of [...ROOM_TYPES, ...roomTypeRules.map((r) => r.roomType)]) {
      if (seenRoomTypes.has(rt)) continue;
      seenRoomTypes.add(rt);
      collectKey(rt, roomTypeRules.filter((r) => r.roomType === rt));
    }

    return (
      <>
        {orderedKeys.map(({ key, rules }) => (
          <div key={key} className="mb-8">
            <SectionDivider label={key} />
            {showGroupLabel ? (
              activeGroups.map((group) => {
                const groupRules = rules.filter((r) => r.hotelGroup === group);
                if (groupRules.length === 0) return null;
                return (
                  <div key={group}>
                    <SubSectionDivider label={group} />
                    {renderSubGroup(`gran|${key}|${group}`, groupRules)}
                  </div>
                );
              })
            ) : (
              renderSubGroup(`gran|${key}|${activeGroups[0] ?? ""}`, rules)
            )}
          </div>
        ))}
      </>
    );
  }

  return (
    <div className="flex flex-col flex-1 px-6 py-5" style={{ backgroundColor: colors.pageBg }}>
      {/* ── Title + actions row ── */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <h1 className="text-[22px] font-bold" style={{ color: colors.textPrimary }}>
            Restriction Guidelines
          </h1>
          <InfoTooltip text="Restriction guidelines define strategies across a hotel group. They can only be edited or removed from this page — any changes apply to all properties in the group." />
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/restrictions/new"
            className="flex items-center gap-1.5 px-4 h-9 rounded text-[13px] font-bold"
            style={{ backgroundColor: colors.primary, color: colors.white }}
          >
            <PlusIcon />
            New Guideline
          </Link>
          <div className="w-px self-stretch my-1" style={{ backgroundColor: colors.border }} />
          <button
            className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 transition-colors"
            style={{ color: colors.textSecondary, borderRadius: "20%" }}
            title="Download"
          >
            <DownloadIcon />
          </button>
        </div>
      </div>

      {/* ── Content area: filters column + cards ── */}
      <div className="flex flex-1 gap-8">

        {/* ── Filters column ── */}
        <div className="shrink-0" style={{ width: "188px" }}>

          {/* Hotel Group */}
          <FilterSection
            label="Hotel Group"
            sectionKey="hotelGroup"
            collapsed={collapsedSections.has("hotelGroup")}
            onToggle={toggleSection}
          >
            <>
              <button
                onClick={() =>
                  selectedGroups.length === HOTEL_GROUPS.length
                    ? setSelectedGroups([])
                    : setSelectedGroups(HOTEL_GROUPS)
                }
                className="text-[12px] mb-2 hover:underline"
                style={{ color: colors.primary }}
              >
                {selectedGroups.length === HOTEL_GROUPS.length ? "Deselect All" : "Select All"}
              </button>
              <div className="flex flex-col gap-1.5">
                {HOTEL_GROUPS.map((g) => (
                  <label key={g} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedGroups.includes(g)}
                      onChange={() => toggleGroup(g)}
                      className={`w-4 h-4 rounded accent-[${colors.primary}]`}
                    />
                    <span className="text-[13px] leading-tight" style={{ color: colors.textPrimary }}>{g}</span>
                  </label>
                ))}
              </div>
            </>
          </FilterSection>

          {/* Granularity */}
          <FilterSection
            label="Granularity"
            sectionKey="granularity"
            collapsed={collapsedSections.has("granularity")}
            onToggle={toggleSection}
          >
            <>
              {/* Property */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: colors.textDisabled }}>Property</p>
                  <button
                    onClick={() => setPropertySelected((prev) => !prev)}
                    className="text-[11px] hover:underline"
                    style={{ color: colors.primary }}
                  >
                    {propertySelected ? "Deselect All" : "Select All"}
                  </button>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={propertySelected}
                    onChange={() => setPropertySelected((prev) => !prev)}
                    className={`w-4 h-4 rounded accent-[${colors.primary}]`}
                  />
                  <span className="text-[13px]" style={{ color: colors.textPrimary }}>Property</span>
                </label>
              </div>

              {/* Segments */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: colors.textDisabled }}>Segments</p>
                  <button
                    onClick={() =>
                      SEGMENTS.every((s) => activeSegmentsSubrates.includes(s))
                        ? setActiveSegmentsSubrates((prev) => prev.filter((s) => !SEGMENTS.includes(s)))
                        : setActiveSegmentsSubrates((prev) => [...new Set([...prev, ...SEGMENTS])])
                    }
                    className="text-[11px] hover:underline"
                    style={{ color: colors.primary }}
                  >
                    {SEGMENTS.every((s) => activeSegmentsSubrates.includes(s)) ? "Deselect All" : "Select All"}
                  </button>
                </div>
                <div className="flex flex-col gap-1.5">
                  {SEGMENTS.map((seg) => (
                    <label key={seg} className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={activeSegmentsSubrates.includes(seg)}
                          onChange={() => toggleSegmentSubrate(seg)}
                          className={`w-4 h-4 rounded accent-[${colors.primary}]`}
                        />
                        <span className="text-[13px]" style={{ color: colors.textPrimary }}>{seg}</span>
                      </div>
                      <span className="text-[12px]" style={{ color: colors.textDisabled }}>({segmentSubrateCounts[seg]})</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sub Rates */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: colors.textDisabled }}>Sub Rates</p>
                  <button
                    onClick={() =>
                      MOCK_SUB_RATES.every((s) => activeSegmentsSubrates.includes(s))
                        ? setActiveSegmentsSubrates((prev) => prev.filter((s) => !MOCK_SUB_RATES.includes(s)))
                        : setActiveSegmentsSubrates((prev) => [...new Set([...prev, ...MOCK_SUB_RATES])])
                    }
                    className="text-[11px] hover:underline"
                    style={{ color: colors.primary }}
                  >
                    {MOCK_SUB_RATES.every((s) => activeSegmentsSubrates.includes(s)) ? "Deselect All" : "Select All"}
                  </button>
                </div>
                <div className="flex flex-col gap-1.5">
                  {MOCK_SUB_RATES.map((sr) => (
                    <label key={sr} className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={activeSegmentsSubrates.includes(sr)}
                          onChange={() => toggleSegmentSubrate(sr)}
                          className={`w-4 h-4 rounded accent-[${colors.primary}]`}
                        />
                        <span className="text-[13px]" style={{ color: colors.textPrimary }}>{sr}</span>
                      </div>
                      <span className="text-[12px]" style={{ color: colors.textDisabled }}>({segmentSubrateCounts[sr]})</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Room Type */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: colors.textDisabled }}>Room Type</p>
                  <button
                    onClick={() =>
                      activeRoomTypes.length === ROOM_TYPES.length
                        ? setActiveRoomTypes([])
                        : setActiveRoomTypes(ROOM_TYPES)
                    }
                    className="text-[11px] hover:underline"
                    style={{ color: colors.primary }}
                  >
                    {activeRoomTypes.length === ROOM_TYPES.length ? "Deselect All" : "Select All"}
                  </button>
                </div>
                <div className="flex flex-col gap-1.5">
                  {ROOM_TYPES.map((rt) => (
                    <label key={rt} className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={activeRoomTypes.includes(rt)}
                          onChange={() => toggleRoomType(rt)}
                          className={`w-4 h-4 rounded accent-[${colors.primary}]`}
                        />
                        <span className="text-[13px]" style={{ color: colors.textPrimary }}>{rt}</span>
                      </div>
                      <span className="text-[12px]" style={{ color: colors.textDisabled }}>({roomTypeCounts[rt]})</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          </FilterSection>

          {/* Status */}
          <FilterSection
            label="Status"
            sectionKey="status"
            collapsed={collapsedSections.has("status")}
            onToggle={toggleSection}
          >
            <div className="flex flex-col gap-1.5">
              {(["all", "active", "inactive"] as const).map((val) => (
                <label key={val} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    checked={statusFilter === val}
                    onChange={() => setStatusFilter(val)}
                    className={`accent-[${colors.primary}]`}
                  />
                  <span className="text-[13px]" style={{ color: colors.textPrimary }}>
                    {val === "all" ? "All" : val === "active" ? "Only Active" : "Only Inactive"}
                  </span>
                </label>
              ))}
            </div>
          </FilterSection>
        </div>

        {/* ── Cards column ── */}
        <div className="flex-1 min-w-0">
          {/* Sort control */}
          <div className="flex items-center justify-end gap-2 mb-4">
            <span className="text-[12px]" style={{ color: colors.textSecondary }}>Sort by:</span>
            <Select
              value={{ group: "Hotel Group", granularity: "Granularity" }[sortBy]}
              options={["Hotel Group", "Granularity"]}
              onChange={(label) => {
                const map: Record<string, SortBy> = { "Hotel Group": "group", "Granularity": "granularity" };
                setSortBy(map[label]);
              }}
              width={148}
            />
          </div>

          {!hasAnyContent ? (
            <div className="flex flex-col items-center justify-center py-20" style={{ color: colors.textDisabled }}>
              <p className="text-[15px] font-bold mb-1">No guidelines match current filters</p>
              <p className="text-[13px]">Try adjusting the segment, room type, or status filters.</p>
            </div>
          ) : (
            <>
              {sortBy === "group" && renderByGroup()}
              {sortBy === "granularity" && renderByGranularity()}
            </>
          )}
        </div>
      </div>

      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-lg shadow-xl text-[14px] font-semibold flex items-center gap-2"
          style={{ backgroundColor: colors.primary, color: colors.white, whiteSpace: "nowrap" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
          </svg>
          {toast}
        </div>
      )}
    </div>
  );
}

// ─── Hotels chip + popover ────────────────────────────────────────────────────

function HotelsChip({ group }: { group: string }) {
  const hotels = MOCK_PROPERTIES_BY_GROUP[group] ?? [];
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      setOpen(false);
      void e;
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative inline-block">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((p) => !p); }}
        className="flex items-center gap-0.5 text-[12px] hover:underline"
        style={{ color: colors.primary }}
      >
        {hotels.length} {hotels.length === 1 ? "hotel" : "hotels"}
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="currentColor"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 150ms" }}
        >
          <path d="M7 10l5 5 5-5H7z" />
        </svg>
      </button>
      {open && (
        <div
          className="absolute left-0 z-50 rounded shadow-lg py-2"
          style={{
            top: "calc(100% + 4px)",
            backgroundColor: colors.white,
            border: `1px solid ${colors.border}`,
            minWidth: "220px",
          }}
        >
          <p
            className="px-3 pb-1.5 text-[11px] font-bold uppercase tracking-widest"
            style={{ color: colors.textDisabled }}
          >
            {group}
          </p>
          {hotels.map((h) => (
            <div key={h.name} className="px-3 py-1 text-[13px]" style={{ color: colors.textPrimary }}>
              {h.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Guideline Card ───────────────────────────────────────────────────────────

function GuidelineCard({
  rule,
  active,
  onToggle,
}: {
  rule: GuidelineRule;
  active: boolean;
  onToggle: () => void;
}) {
  const granularity = inferGranularity(rule);
  const { bg, text } = GRANULARITY_COLORS[granularity] ?? GRANULARITY_COLORS.segment;
  const chipLabel =
    granularity === "property" ? "Property"
    : granularity === "roomtype" ? rule.roomType
    : rule.segment;

  return (
    <div
      className="rounded group"
      style={{
        backgroundColor: colors.white,
        boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)",
      }}
    >
      <div className="flex items-start justify-between px-4 pt-4 pb-3">
        <div className="flex flex-col min-w-0 flex-1 mr-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span
              className="inline-flex items-center px-2.5 h-6 rounded-full text-[12px] font-medium shrink-0"
              style={{ backgroundColor: bg, color: text }}
            >
              {chipLabel}
            </span>
            <span className="text-[15px] font-bold truncate" style={{ color: colors.textPrimary }}>
              {rule.name}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[12px]" style={{ color: colors.textDisabled }}>{rule.hotelGroup}</span>
            <span className="text-[12px]" style={{ color: colors.border }}>·</span>
            <HotelsChip group={rule.hotelGroup} />
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-6 h-6 flex items-center justify-center opacity-30" style={{ color: colors.textSecondary }}>
              <DragHandleIcon />
            </div>
            <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100" title="Copy">
              <CopyIcon />
            </button>
            <Link
              href={`/restrictions/${rule.id}/edit`}
              className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100"
              title="Edit"
            >
              <EditIcon />
            </Link>
            <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100" title="Delete">
              <DeleteIcon />
            </button>
          </div>
          <Toggle active={active} onToggle={onToggle} />
        </div>
      </div>

      <div className="border-t mx-4" style={{ borderColor: colors.border }} />

      <div className="px-4 py-3 flex flex-col gap-1.5">
        <DetailRow label="Stay Date" value={rule.stayDate} />
        <DetailRow label="Criteria" value={rule.criteria} />
        <DetailRow label="Restrictions" value={restrictionSummary(rule.restrictions)} />
        <DetailRow label="Created" value={rule.created} />
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-1">
      <span className="text-[12px] w-20 shrink-0 text-right" style={{ color: colors.textDisabled }}>
        {label}:
      </span>
      <span className="text-[13px]" style={{ color: colors.textPrimary }}>
        {value}
      </span>
    </div>
  );
}
