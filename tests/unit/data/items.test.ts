import { describe, expect, it } from "vitest";
import { RAW_ITEMS, BLOCKS } from "../../../supabase/seed/items.v0.2.ts";
import { TYPE_CODES } from "../../../src/scoring/types.ts";
import { BLOCK_ITEM_RANGES } from "../../../src/scoring/config.ts";
import {
  ASSESSMENT_ITEMS,
  ASSESSMENT_BLOCKS,
  TOTAL_ITEMS,
  TOTAL_OPTIONS
} from "../../../src/data/assessment.items.v0.2.ts";

describe("Integrite de la matrice (source privee)", () => {
  it("contient exactement 45 items", () => {
    expect(RAW_ITEMS).toHaveLength(45);
  });

  it("numerote les items de 1 a 45 sans doublon ni trou", () => {
    const ids = RAW_ITEMS.map((item) => item.id).sort((a, b) => a - b);
    expect(ids).toEqual(Array.from({ length: 45 }, (_, index) => index + 1));
  });

  it("propose exactement 6 options par item, une par type, sans doublon", () => {
    for (const item of RAW_ITEMS) {
      expect(item.options).toHaveLength(6);
      const codes = item.options.map((option) => option.typeCode).sort();
      expect(codes).toEqual([...TYPE_CODES].sort());
    }
  });

  it("respecte les plages de blocs declarees dans la configuration de scoring", () => {
    for (const block of BLOCKS) {
      const [start, end] = BLOCK_ITEM_RANGES[block.id];
      expect(block.itemRange).toEqual([start, end]);
      const itemsInBlock = RAW_ITEMS.filter((item) => item.blockId === block.id);
      expect(itemsInBlock).toHaveLength(end - start + 1);
      for (const item of itemsInBlock) {
        expect(item.id).toBeGreaterThanOrEqual(start);
        expect(item.id).toBeLessThanOrEqual(end);
      }
    }
  });

  it("couvre les 8 blocs sans chevauchement", () => {
    const coveredIds = new Set<number>();
    for (const block of BLOCKS) {
      const [start, end] = block.itemRange;
      for (let id = start; id <= end; id += 1) {
        expect(coveredIds.has(id)).toBe(false);
        coveredIds.add(id);
      }
    }
    expect(coveredIds.size).toBe(45);
  });
});

describe("Donnees publiques generees", () => {
  it("est synchronisee avec la source privee (mêmes ids, mêmes textes, mêmes blocs)", () => {
    expect(TOTAL_ITEMS).toBe(45);
    expect(TOTAL_OPTIONS).toBe(270);
    expect(ASSESSMENT_ITEMS).toHaveLength(RAW_ITEMS.length);

    RAW_ITEMS.forEach((rawItem, index) => {
      const publicItem = ASSESSMENT_ITEMS[index];
      expect(publicItem.id).toBe(rawItem.id);
      expect(publicItem.blockId).toBe(rawItem.blockId);
      expect(publicItem.prompt).toBe(rawItem.prompt);
      expect(publicItem.options).toHaveLength(rawItem.options.length);
      rawItem.options.forEach((rawOption, optionIndex) => {
        const publicOption = publicItem.options[optionIndex];
        expect(publicOption.id).toBe(`item-${rawItem.id}-${rawOption.letter}`);
        expect(publicOption.text).toBe(rawOption.text);
      });
    });

    expect(ASSESSMENT_BLOCKS).toEqual(BLOCKS);
  });

  it("ne contient jamais de code de type interne (aucune fuite au candidat)", () => {
    for (const item of ASSESSMENT_ITEMS) {
      for (const option of item.options) {
        expect(Object.keys(option).sort()).toEqual(["id", "text"]);
      }
    }
  });
});
