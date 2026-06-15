import { NextResponse } from 'next/server';
export declare function GET(): Promise<NextResponse<{
    status: string;
    nextVersion: number;
    timestamp: string;
}>>;
