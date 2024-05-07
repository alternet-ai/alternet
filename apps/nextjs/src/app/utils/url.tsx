import { env } from "~/env";

export const DEPLOYMENT_URL = env.NODE_ENV === 'development' 
    ? 'http://' + env.NEXT_PUBLIC_VERCEL_URL
    : 'https://' + env.NEXT_PUBLIC_VERCEL_URL;