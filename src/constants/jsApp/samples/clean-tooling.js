/**
 * Calculates the total cost of a trip.
 * @param {number} days         number of days travelled
 * @param {number} pricePerDay  cost for one day, in rupees
 * @returns {number} the total in rupees
 */
export const calculateTripCost = (days, pricePerDay) => days * pricePerDay;

// package.json scripts: automate the standards so nobody argues about them
// "lint":   "eslint .",          // catches bugs: unused variables, == vs ===
// "format": "prettier --write .", // one consistent style, zero debates
// "test":   "vitest"              // pure functions are easy to test
