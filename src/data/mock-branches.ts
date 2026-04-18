import type { Branch } from "./types";
import { HADERA_BRANCH_SEED } from "./hadera-seed";
import { generateBranch, type GenerateBranchTemplate } from "./generators";

type MockBranchDef = Omit<GenerateBranchTemplate, "baseSeed">;

// Each generated branch carries an explicit deterministic `seed` so the
// inflated Branch is snapshot-stable across reloads. Seeds are chosen
// from the branch number to stay readable and unique.
const mockBranchDefs: MockBranchDef[] = [
  {
    id: "haifa-12",
    name: "חיפה",
    branchNumber: 12,
    regionId: "north",
    lat: 32.794,
    lng: 34.9896,
    scale: 1.3,
    format: "city",
    seed: 12_001,
  },
  {
    id: "afula-28",
    name: "עפולה",
    branchNumber: 28,
    regionId: "north",
    lat: 32.607,
    lng: 35.2882,
    scale: 0.7,
    format: "city",
    seed: 28_001,
  },
  {
    id: "tiberias-35",
    name: "טבריה",
    branchNumber: 35,
    regionId: "north",
    lat: 32.7922,
    lng: 35.5312,
    scale: 0.6,
    format: "city",
    seed: 35_001,
  },
  {
    id: "netanya-18",
    name: "נתניה",
    branchNumber: 18,
    regionId: "center",
    lat: 32.3215,
    lng: 34.8532,
    scale: 1.1,
    format: "city",
    seed: 18_001,
  },
  {
    id: "tlv-03",
    name: "תל אביב",
    branchNumber: 3,
    regionId: "center",
    lat: 32.0853,
    lng: 34.7818,
    scale: 1.5,
    format: "big",
    seed: 3_001,
  },
  {
    id: "kfar-saba-22",
    name: "כפר סבא",
    branchNumber: 22,
    regionId: "center",
    lat: 32.178,
    lng: 34.907,
    scale: 0.9,
    format: "city",
    seed: 22_001,
  },
  {
    id: "modiin-31",
    name: "מודיעין",
    branchNumber: 31,
    regionId: "center",
    lat: 31.8969,
    lng: 35.0104,
    scale: 0.85,
    format: "city",
    seed: 31_001,
  },
  {
    id: "rishon-07",
    name: "ראשון לציון",
    branchNumber: 7,
    regionId: "south",
    lat: 31.973,
    lng: 34.7925,
    scale: 1.2,
    format: "big",
    seed: 7_001,
  },
  {
    id: "ashdod-15",
    name: "אשדוד",
    branchNumber: 15,
    regionId: "south",
    lat: 31.8014,
    lng: 34.6435,
    scale: 1.0,
    format: "city",
    seed: 15_001,
  },
  {
    id: "beer-sheva-25",
    name: "באר שבע",
    branchNumber: 25,
    regionId: "south",
    lat: 31.2518,
    lng: 34.7913,
    scale: 1.1,
    format: "city",
    seed: 25_001,
  },
  {
    id: "eilat-40",
    name: "אילת",
    branchNumber: 40,
    regionId: "south",
    lat: 29.5569,
    lng: 34.9498,
    scale: 0.5,
    format: "city",
    seed: 40_001,
  },
];

export const MOCK_BRANCH_DEFS: readonly MockBranchDef[] = mockBranchDefs;

export const allBranches: Branch[] = [
  HADERA_BRANCH_SEED,
  ...mockBranchDefs.map((def) => generateBranch(def)),
];

export function getBranch(id: string): Branch | undefined {
  return allBranches.find((b) => b.id === id);
}

export function getBranchesByRegion(regionId: string): Branch[] {
  return allBranches.filter((b) => b.regionId === regionId);
}
