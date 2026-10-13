import StockHistory from '@/models/StockHistory';
import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/models/Product';
import Order from '@/models/Order';
import Setting from '@/models/Setting';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Basic in-memory session for demo (in production, use Redis or DB session)
const sessions: Record<string, any[]> = {};

export async function POST(req: Request) {
  try {
    const { message, sessionId = 'default-session' } = await req.json();

    if (!sessions[sessionId]) {
      sessions[sessionId] = [];
    }

    await connectToDatabase();
    const products = await Product.find({ is_active: true });
    const storeSetting = await Setting.findOne({ key: 'store_name' }).lean();
    const storeName = (storeSetting as any)?.value || 'Ruporong';
    
    let catalog = "Available Products and Prices:\n";
    products.forEach((p) => {
      catalog += `- ${p.name}: ৳${p.price}\n`;
    });

    const systemInstruction = `You are a sales assistant for an e-commerce clothing store named ${storeName}. Your goal is to collect the customer's name, delivery address, and the specific product they want to order.
Here is the current catalog:\n${catalog}
When asked about prices or products, only refer to this catalog. If they ask for something not in the catalog, tell them it's unavailable.
Keep your responses short, polite, and in the language the user speaks.
If they are missing any of the 3 pieces of information, ask for them.
Once you have collected their name, address, and the product they want, you MUST reply with a JSON object formatted exactly like this and nothing else:
{
  "status": "complete",
  "name": "customer name",
  "address": "delivery address",
  "product": "product name they want"
}
Do not use markdown blocks for the JSON, just output the raw JSON.`;

    const chat = ai.chats.create({
        model: 'gemini-3.5-flash-lite',
        config: {
            systemInstruction: systemInstruction,
            temperature: 0.2,
        }
    });

    // We replay the history to the chat object since genai SDK chat object is stateful
    // For a stateless API, we would construct the history. We will simulate it by sending history if needed, 
    // but the @google/genai sdk supports passing history in the config. Let's do it properly.
    
    const formattedHistory = sessions[sessionId].map(msg => ({
        role: msg.role === 'ai' ? 'model' : 'user',
        parts: [{ text: msg.text }]
    }));

    const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash-lite',
        contents: [...formattedHistory, { role: 'user', parts: [{ text: message }] }],
        config: {
            systemInstruction: systemInstruction,
            temperature: 0.2
        }
    });

    const replyText = response.text || '';

    // Check if the reply is JSON (order complete)
    let parsedJson = null;
    try {
      parsedJson = JSON.parse(replyText.trim());
    } catch (e) {
      // not json
    }

    if (parsedJson && parsedJson.status === 'complete') {
      // Parse and deduct stock
      const session = await mongoose.startSession();
      session.startTransaction();
      
      let newOrder;
      try {
        const orderId = 'ORD-' + Math.floor(Math.random() * 1000000);
        
        let qty = 1;
        let pName = parsedJson.product;
        const match = parsedJson.product.match(/^(\d+)x\s+(.+)$/i);
        if (match) {
           qty = parseInt(match[1], 10);
           pName = match[2].trim();
        }
        
        const product = await Product.findOne({ name: new RegExp('^' + pName + '$', 'i') }).session(session);
        if (product) {
          const prevStock = product.stock;
          const updatedProduct = await Product.findOneAndUpdate(
            { _id: product._id, stock: { $gte: qty } },
            { $inc: { stock: -qty } },
            { session, new: true }
          );
          if (!updatedProduct) {
             throw new Error('Insufficient stock');
          }
          
          await StockHistory.create([{
            product_id: product._id,
            order_id: orderId,
            previous_stock: prevStock,
            quantity_change: -qty,
            new_stock: updatedProduct.stock,
            reason: 'Order Placed via Chat'
          }], { session });
        }
        
        const created = await Order.create([{
          order_id: orderId,
          customer_name: parsedJson.name,
          customer_address: parsedJson.address,
          product_name: parsedJson.product,
          source: 'web_chat',
          status: 'pending',
          is_restocked: false
        }], { session });
        
        newOrder = created[0];
        await session.commitTransaction();
      } catch (err) {
        await session.abortTransaction();
        session.endSession();
        return NextResponse.json({ 
          reply: `Sorry ${parsedJson.name}, but we don't have enough stock for ${parsedJson.product} right now.` 
        });
      }
      session.endSession();

      // Reset session
      sessions[sessionId] = [];

      return NextResponse.json({ 
        reply: `Thank you, ${parsedJson.name}! Your order for ${parsedJson.product} has been placed successfully. Your Order ID is ${newOrder.order_id}. We will deliver it to ${parsedJson.address} soon.` 
      });
    }

    // Save to history
    sessions[sessionId].push({ role: 'user', text: message });
    sessions[sessionId].push({ role: 'ai', text: replyText });

    return NextResponse.json({ reply: replyText });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ reply: 'Sorry, I am having a little trouble connecting right now.' }, { status: 500 });
  }
}
