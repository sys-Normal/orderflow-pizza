// Brand name used to build store/branch display names (e.g. "${PROJECT_NAME} 강남점").
// Change this in one place to rebrand every generated branch name.
export const PROJECT_NAME = "orderflow";

// Used to center the store-finder map when the customer denies (or the
// browser doesn't support) location access, so the map still has somewhere
// to show. Seoul City Hall — same value as Store's schema-level lat/lng default.
export const FALLBACK_LOCATION = { latitude: 37.5665, longitude: 126.978 };
