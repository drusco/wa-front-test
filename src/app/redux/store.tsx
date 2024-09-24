"use client";

import { combineReducers, configureStore } from "@reduxjs/toolkit";
import hierarchiesReducer from "./features/hierarchySlice";

const rootReducer = combineReducers({
  hierarchies: hierarchiesReducer,
});

export type rootState = ReturnType<typeof rootReducer>;

export const store = configureStore({
  reducer: rootReducer,
});
