module.exports = {
  plugins: [
    require('cssnano')({
      preset: ['default', {
        discardComments: {
          removeAll: true,
        },
        normalizeWhitespace: true,
        minifyFontValues: true,
        minifyGradients: true,
        reduceIdents: false,
        zindex: false,
        calc: {
          precision: 2
        },
        colormin: true,
        convertValues: {
          length: false
        },
        orderedValues: true,
        minifySelectors: true,
        minifyParams: true,
        normalizeCharset: true,
        normalizeUrl: true,
        mergeRules: true,
        mergeLonghand: true,
        mergeIdents: false,
        uniqueSelectors: true,
        discardDuplicates: true,
        discardOverridden: true,
        discardEmpty: true,
        minifyFontWeight: true,
        normalizeTimingFunctions: true,
        normalizeUnicode: true,
        normalizePositions: true,
        normalizeRepeatStyle: true,
        normalizeString: true,
        normalizeDisplayValues: true,
      }],
    }),
  ],
};