import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import crypto from 'crypto';

// SePay Webhook Payload Standard
// Tham khảo: https://my.sepay.vn/docs/webhook
type SePayWebhookPayload = {
  id: number;
  gateway: string;
  transactionDate: string;
  accountNumber: string;
  subAccount: string | null;
  code: string | null;
  content: string; // Nội dung CK, VD: "Nguyen Van A CK TZ8129"
  transferType: "in" | "out";
  transferAmount: number;
  accumulated: number;
  channel: string;
  referenceCode: string;
};

// Khuyến nghị: thiết lập SePay API Token trong .env để bảo mật webhook
const SEPAY_API_TOKEN = process.env.SEPAY_API_TOKEN || ''; 

export async function POST(req: Request) {
  try {
    // 1. Xác thực Webhook từ SePay (Tuỳ chọn nhưng rất nên có)
    const authHeader = req.headers.get('Authorization');
    if (SEPAY_API_TOKEN && authHeader !== `Apikey ${SEPAY_API_TOKEN}`) {
      // Bỏ qua xác thực nếu đang test local (không có SEPAY_API_TOKEN)
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const payload: SePayWebhookPayload = await req.json();

    // Chỉ xử lý giao dịch Nạp tiền vào (transferType: "in")
    if (payload.transferType !== 'in') {
        return NextResponse.json({ success: true, message: 'Ignored outbound transaction' });
    }

    // 2. Tìm mã số đơn hàng trong nội dung chuyển khoản
    // Regex tìm chuỗi có định dạng TZ theo sau là 5 kí tự chữ/số
    const orderCodeMatch = payload.content.match(/TZ[A-Z0-9]{5}/i);
    
    if (!orderCodeMatch) {
      return NextResponse.json({ success: true, message: 'No order code found in content' });
    }

    const orderCode = orderCodeMatch[0].toUpperCase();

    // 3. Tra cứu Đơn Hàng trong Database
    const order = await db.paymentOrder.findUnique({
      where: { orderCode }
    });

    if (!order) {
      return NextResponse.json({ success: true, message: `Order ${orderCode} not found` });
    }

    if (order.status === 'SUCCESS') {
      return NextResponse.json({ success: true, message: 'Order already processed' });
    }

    // 4. Kiểm tra số tiền chuyển
    if (payload.transferAmount >= order.amount) {
      // Đủ hoặc dư tiền
      await db.paymentOrder.update({
        where: { id: order.id },
        data: {
          status: 'SUCCESS',
          transactionRef: String(payload.id)
        }
      });
      // PremiumSession sẽ được tạo bởi luồng Polling để lấy được deviceFingerprint của Client
    } else {
      // Chuyển thiếu tiền
      await db.paymentOrder.update({
        where: { id: order.id },
        data: {
          status: 'PARTIAL_PAID',
          transactionRef: String(payload.id)
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Xử lý webhook thất bại' }, { status: 500 });
  }
}
