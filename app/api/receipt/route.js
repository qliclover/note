import { NextResponse } from "next/server";
import { generateObject } from "ai";
import {z} from 'zod';
import { getUserIdFromRequest } from "@/lib/auth";

// Tell ai what shape of data we want
const receiptSchema = z.object({
    merchant: z.string().describe('Store or merchant name'),
    date: z.string().nullable().describe('Receipt date, null if not found'),
    currency: z.string().nullable().describe('Currency code like USD, null if not found'),
    items: z.array(z.object({
        name: z.string().describe('Item name'),
        price: z.number().describe('Item original price'),
    })).describe('Line items on the receipt'),
    subtotal: z.number().nullable().describe('Subtotal, null if not present'),
    discount: z.number().nullable().describe('Discount amount as a positive number, null if none'),
    tax: z.number().nullable().describe('Tax amount, null if none'),
    shipping: z.number().nullable().describe('Shipping fee, null if none'),
    tips: z.number().nullable().describe('Tip amount, null if none'),
    total: z.number().describe('Final total actually paid'),
});

export async function POST(request) {
    try {
        // block if not logged in 
        const userId = getUserIdFromRequest(request);
        if (!userId) return NextResponse.json({error: 'not logged in'}, {status: 401});

        // get the image sent from the frontend
        const {image} = await request.json();
        if (!image) return NextResponse.json({error: 'no image'}, {status: 400});

        // ask the ai vision model to read the receipt into our schema
        const {object} = await generateObject({
            model: 'anthropic/claude-sonnet-5',
            schema: receiptSchema,
            messages: [{
                role: 'user',
                content: [
                    {type: 'text', text: 'This is a receipt photo. Extract its details into the schema. Money fields are numbers only ( no symbols). Missing fields = null'},
                    {type: 'image', image},
                ],
            }],
        });

        // return the structured data
        return NextResponse.json({receipt: object});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: 'server error'}, {status: 500});
    }
}