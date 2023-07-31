import { NextRequest, NextResponse } from "next/server";
import { json2ts } from 'json-ts';

export async function POST(req: NextRequest) {
    const { json } = await req.json();

    try {
        const result = json2ts(json)
        return NextResponse.json({ result }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ error: err }, { status: 400 });
    }
}