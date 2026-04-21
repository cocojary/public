import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { z } from 'zod';

const createOrderSchema = z.object({
  userEmail: z.string().email('Email không hợp lệ'),
  userPhone: z.string().optional(),
});

// Cấu hình Ngân hàng nhận tiền (Mặc định dùng VietQR)
// Hướng dẫn cấu hình: BANK_ID: Tên viết tắt ngân hàng (VCB, MB, ACB...), ACCOUNT_NO: Số tài khoản
const BANK_ID = process.env.VIETQR_BANK_ID || 'MB';
const ACCOUNT_NO = process.env.VIETQR_ACCOUNT_NO || '123456789';
const ACCOUNT_NAME = process.env.VIETQR_ACCOUNT_NAME || 'CONG TY TNHH TECHZEN';
const AMOUNT = 49000;

function generateOrderCode() {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'TZ';
  for (let i = 0; i < 5; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = createOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { userEmail, userPhone } = parsed.data;
    
    // Đảm bảo mã giao dịch là duy nhất
    let orderCode = generateOrderCode();
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 5) {
      const existing = await db.paymentOrder.findUnique({ where: { orderCode } });
      if (!existing) {
        isUnique = true;
      } else {
        orderCode = generateOrderCode();
        attempts++;
      }
    }

    if (!isUnique) throw new Error("Could not generate a unique order code");

    // Tạo Order trong Database
    const order = await db.paymentOrder.create({
      data: {
        orderCode,
        userEmail,
        userPhone,
        amount: AMOUNT,
        status: 'PENDING',
      },
    });

    // Tạo URL VietQR (Sử dụng cổng img.vietqr.io)
    const qrUrl = `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-print.png?amount=${AMOUNT}&addInfo=${orderCode}&accountName=${encodeURIComponent(ACCOUNT_NAME)}`;

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.id,
        orderCode,
        amount: AMOUNT,
        qrUrl,
      }
    });

  } catch (error: any) {
    console.error('Error creating VietQR order:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi khi tạo đơn hàng' }, { status: 500 });
  }
}
