module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: {
        node: 'current'
      },
      modules: 'commonjs'
    }],
    '@babel/preset-typescript',
    ['@babel/preset-react', {
      runtime: 'automatic'
    }]
  ],
  plugins: [
    ['@babel/plugin-transform-modules-commonjs', {
      strictMode: true,
      allowTopLevelThis: true
    }],
    ['@babel/plugin-transform-runtime', {
      regenerator: true,
      helpers: true,
      useESModules: false
    }]
  ]
}; 