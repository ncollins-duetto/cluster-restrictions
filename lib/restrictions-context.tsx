"use client";

import { createContext, useContext, useState } from "react";
import type { GuidelineRule } from "./types";
import { MOCK_RULES } from "./data";

type RestrictionsContextType = {
  rules: GuidelineRule[];
  ruleStates: Record<string, boolean>;
  addRule: (rule: GuidelineRule) => void;
  addRules: (rules: GuidelineRule[]) => void;
  updateRule: (id: string, updates: Partial<GuidelineRule>) => void;
  toggleRule: (id: string) => void;
  reorderRulesInGroup: (groupIds: string[]) => void;
  toast: string | null;
  clearToast: () => void;
};

const RestrictionsContext = createContext<RestrictionsContextType | null>(null);

export function RestrictionsProvider({ children }: { children: React.ReactNode }) {
  const [rules, setRules] = useState<GuidelineRule[]>(MOCK_RULES);
  const [ruleStates, setRuleStates] = useState<Record<string, boolean>>(
    Object.fromEntries(MOCK_RULES.map((r) => [r.id, r.active]))
  );
  const [toast, setToast] = useState<string | null>(null);

  function addRule(rule: GuidelineRule) {
    setRules((prev) => [...prev, rule]);
    setRuleStates((prev) => ({ ...prev, [rule.id]: true }));
    setToast("Guideline created");
  }

  function addRules(newRules: GuidelineRule[]) {
    setRules((prev) => [...prev, ...newRules]);
    setRuleStates((prev) => ({
      ...prev,
      ...Object.fromEntries(newRules.map((r) => [r.id, true])),
    }));
    setToast(newRules.length === 1 ? "Guideline created" : `${newRules.length} guidelines created`);
  }

  function updateRule(id: string, updates: Partial<GuidelineRule>) {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
    setToast("Changes saved");
  }

  function toggleRule(id: string) {
    setRuleStates((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  // Reorders items in a group while preserving the positions of all other rules.
  // groupIds is the new desired order for that subset of rules.
  function reorderRulesInGroup(groupIds: string[]) {
    setRules((prev) => {
      const inGroup = new Set(groupIds);
      const byId = Object.fromEntries(prev.map((r) => [r.id, r]));
      const positions = prev.reduce<number[]>((acc, r, i) => {
        if (inGroup.has(r.id)) acc.push(i);
        return acc;
      }, []);
      const next = [...prev];
      groupIds.forEach((id, i) => {
        if (i < positions.length) next[positions[i]] = byId[id];
      });
      return next;
    });
  }

  function clearToast() {
    setToast(null);
  }

  return (
    <RestrictionsContext.Provider
      value={{ rules, ruleStates, addRule, addRules, updateRule, toggleRule, reorderRulesInGroup, toast, clearToast }}
    >
      {children}
    </RestrictionsContext.Provider>
  );
}

export function useRestrictions() {
  const ctx = useContext(RestrictionsContext);
  if (!ctx) throw new Error("useRestrictions must be used within RestrictionsProvider");
  return ctx;
}
