"use client";

import { createSlice } from "@reduxjs/toolkit";
import type { Item } from "@/app/page";

export interface hierarchy {
  id: string;
  updateDate: null | number;
  createDate: null | number;
  items: Item[];
}

export interface hierarchySlice {
  hierarchies: hierarchy[];
}

const initialState: hierarchySlice = {
  hierarchies: [],
};

export const hierachySlice = createSlice({
  name: "hierarchies",
  initialState,
  reducers: {
    saveHierarchy(
      state,
      { payload }: { payload: { id: string; items: Item[] } }
    ) {
      const now = Date.now();
      const hierarchy = state.hierarchies.find(
        (hierachy) => hierachy.id === payload.id
      );

      if (!hierarchy) {
        const newHierarchy = {
          id: payload.id,
          createDate: now,
          updateDate: now,
          items: JSON.parse(JSON.stringify(payload.items)),
        };

        state.hierarchies = [...state.hierarchies, newHierarchy];

        return;
      }

      hierarchy.updateDate = now;
      hierarchy.items = JSON.parse(JSON.stringify(payload.items));
    },
    removeHierarchy(state, { payload }: { payload: { id: string } }) {
      const hierarchyIndex = state.hierarchies.findIndex(
        (hierachy) => hierachy.id === payload.id
      );
      if (hierarchyIndex >= 0) {
        state.hierarchies.splice(hierarchyIndex, 1);
      }
    },
  },
});

export const { saveHierarchy, removeHierarchy } = hierachySlice.actions;

export default hierachySlice.reducer;
