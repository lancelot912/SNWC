/** This script provides standardized colors for use on the maps
 *
 */
const c = {
  //International Crane Foundation Colors
  icfBlue: chroma.cmyk(0.71, 0.3, 0.13, 0.41),
  icfLightBlue: chroma.cmyk(0.44, 0.15, 0.07, 0.22),
  icfRust: chroma.cmyk(0.11, 0.74, 1, 0.5),
  icfTan: chroma.cmyk(0.08, 0.14, 0.5, 0.24),
  icfGreen: chroma.cmyk(0.54, 0.24, 0.85, 0.69),
  icfLightGreen: chroma.cmyk(0.22, 0.07, 0.51, 0.22),
  icfDropseed: chroma.cmyk(0.44, 0.24, 0.93, 0.09),
  icfIndianGrass: chroma.cmyk(0.27, 0.59, 1, 0.03),
  icfGoldenrod: chroma.cmyk(0.0, 0.31, 1, 0.04),
  icfButteflyWeed: chroma.cmyk(0.0, 0.56, 1, 0.08),
  icfSumac: chroma.cmyk(0.0, 0.9, 1, 0.51),
  icfGentian: chroma.cmyk(0.4, 0.6, 0.15, 0.46)
};

/** Colors below have been tested. Change here and it will change on all maps
 */
// Use for Important Bird Areas
const ibaColor = c.icfGreen
  .saturate(4)
  .brighten(1)
  .hex();
// use for user location
const userColor = c.icfBlue.hex(),
  userOutline = c.icfBlue.brighten(4).hex();

// use for resighting reports
const rsColor = c.icfGoldenrod.brighten(1).hex(),
  rsOutline = c.icfGoldenrod.darken(2).hex();

// Use for eBird Sandhill locations
const sancraColor = c.icfButteflyWeed.hex(),
  sancraOutline = c.icfButteflyWeed.brighten(4).hex();

// Use for Sandhill heatmap
const heatMapColors = chroma
  .scale("RdYlBu")
  .padding([0.2, 0.2])
  .colors(5);