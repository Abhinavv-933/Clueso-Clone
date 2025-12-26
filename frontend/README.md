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

## Media Upload Flow

This project implements a secure, scalable S3 upload architecture using **Presigned URLs**.

### Features
- **Smart Validation**: Category-specific limits (Images: 10MB, Videos: 500MB, PDF: 20MB).
- **Security**: Direct S3 upload prevents server bottlenecks; Clerk auth handles permissions.
- **Real-time Progress**: Smooth 0-100% progress tracking using Axios.
- **Accessibility**: Full ARIA support and drag-and-drop capability.

### Architecture
1. **Frontend**: Request a temporary write permission (Presigned URL) from the backend.
2. **Backend**: Validate session (Clerk) and generate an S3 `PUT` URL via AWS SDK.
3. **S3**: The browser sends the file directly to AWS S3 using the temporary URL.

### Related Files
- `src/components/UploadContainer.tsx`: Main integration logic.
- `src/components/FileUpload.tsx`: Reusable UI with validation & drag-and-drop.
- `src/services/uploadService.ts`: Core API & S3 logic.
- `src/config/env.ts`: Environment and secure logging.
