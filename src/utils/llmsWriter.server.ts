import fs from 'fs/promises'
import path from 'path'
import type { PortfolioData } from '../data/provider'
import { generateLlmsTxt, generateLlmsFullTxt } from './llmsGenerator'

/**
 * Auto-sync static /public/llms.txt and /public/llms-full.txt files on the server
 */
export async function syncStaticLlmsFiles(data: PortfolioData): Promise<void> {
  try {
    const publicDir = path.join(process.cwd(), 'public')
    await fs.mkdir(publicDir, { recursive: true })

    const llmsTxt = generateLlmsTxt(data)
    const llmsFullTxt = generateLlmsFullTxt(data)

    await fs.writeFile(path.join(publicDir, 'llms.txt'), llmsTxt, 'utf-8')
    await fs.writeFile(path.join(publicDir, 'llms-full.txt'), llmsFullTxt, 'utf-8')
    console.log('✅ Auto-generated static /public/llms.txt and /public/llms-full.txt')
  } catch (err) {
    console.warn('Could not auto-write static llms files to public directory:', err)
  }
}
