import { execSync } from 'child_process'

console.log('🚀 Starting Cloudflare Workers Deployment Process...')
console.log('==================================================')

try {
  console.log('📦 Step 1: Building Production Bundles (Client & SSR)...')
  execSync('npm run build', { stdio: 'inherit' })
  console.log('✅ Build completed successfully!\n')

  console.log('🌐 Step 2: Deploying to Cloudflare Workers with Assets...')
  execSync('npx wrangler deploy', { stdio: 'inherit' })
  console.log('\n🎉 Deployment to Cloudflare Workers completed successfully!')
  console.log('==================================================')
} catch (error) {
  console.error('\n❌ Deployment encountered an issue:', error.message)
  process.exit(1)
}
