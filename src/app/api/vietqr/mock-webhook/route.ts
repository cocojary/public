import { NextResponse } from 'next/server';
import { db } from '@/server/db';

export async function POST(req: Request) {
  try {
    const { orderCode } = await req.json();

    if (!orderCode) {
      return NextResponse.json({ error: 'Missing orderCode' }, { status: 400 });
    }

    // Lấy order
    const order = await db.paymentOrder.findUnique({
      where: { orderCode }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Cập nhật trạng thái thành SUCCESS để test Webhook
    await db.paymentOrder.update({
      where: { id: order.id },
      data: {
        status: 'SUCCESS',
        transactionRef: 'MOCK_' + Math.floor(Math.random() * 1000000),
      }
    });

    return NextResponse.json({ success: true, message: `Order ${orderCode} marked as SUCCESS` });

  } catch (error: any) {
    console.error('Mock webhook error:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
