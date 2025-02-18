This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


# Setup project
# Create a new Next.js project with TypeScript
npx create-next-app@latest time-tracker --typescript --tailwind --eslint

# Navigate into the project directory
cd time-tracker

# Install additional required packages
npm install recharts uuid @types/uuid axios
npm install -D @types/node

# Update Next.js configuration (next.config.js)
cat > next.config.js << 'EOL'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        // Proxy requests to Ollama API
        source: '/api/ollama/:path*',
        destination: 'http://localhost:11434/api/:path*'
      }
    ]
  }
}

module.exports = nextConfig
EOL

# Create API route for time entries
mkdir -p src/app/api/timeEntries/route.ts
cat > src/app/api/timeEntries/route.ts << 'EOL'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const timeEntry = await req.json()
  // Here you would typically save to your NoSQL database
  return NextResponse.json({ success: true, data: timeEntry })
}

export async function GET() {
  // Here you would typically fetch from your NoSQL database
  return NextResponse.json({ entries: [] })
}
EOL

# Create a development service configuration
cat > ~/Library/LaunchAgents/com.timetracker.dev.plist << 'EOL'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.timetracker.dev</string>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/sh</string>
        <string>-c</string>
        <string>cd /path/to/your/time-tracker && npm run dev</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/tmp/timetracker.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/timetracker.error.log</string>
    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin</string>
    </dict>
</dict>
</plist>
EOL

# Create main page component
mkdir -p src/app/page.tsx
cat > src/app/page.tsx << 'EOL'
'use client'

import { TimeTracker } from '@/components/TimeTracker'

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <TimeTracker />
    </main>
  )
}
EOL

# Create components directory and TimeTracker component
mkdir -p src/components

# To do 
[] to save the data into Db so loaded when page refresh