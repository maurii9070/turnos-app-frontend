import antfu from '@antfu/eslint-config'

export default antfu({
  vue: true,
  typescript: true,
  pnpm: true,
  stylistic: {
    indent: 2,
    quotes: 'single',
    braceStyle: 'stroustrup',
  },
})
