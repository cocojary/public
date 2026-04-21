import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { orderId, deviceId } = await req.json();

    if (!orderId || !deviceId) {
      return NextResponse.json({ error: 'Thiếu orderId hoặc deviceId' }, { status: 400 });
    }

    const order = await db.paymentOrder.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return NextResponse.json({ error: 'Không tìm thấy đơn hàng' }, { status: 404 });
    }

    if (order.status === 'SUCCESS') {
      // Đơn hàng đã thành công, cấp quyền truy cập (PremiumSession)
      let session = await db.premiumSession.findUnique({
        where: { orderId: order.id }
      });

      if (!session) {
        // Tạo token hash an toàn (JWT có thể dùng sau, hiện tại dùng crypto random)
        const tokenHash = crypto.randomBytes(32).toString('hex');
        
        // Hạn làm bài là 3 ngày
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 3);

        session = await db.premiumSession.create({
          data: {
            orderId: order.id,
            tokenHash,
            deviceFingerprint: deviceId,
            expiresAt,
          }
        });
      } else {
        // Bảo mật: Không cho phép deviceId khác lấy token
        if (session.deviceFingerprint !== deviceId) {
          return NextResponse.json({ 
            error: 'Đơn hàng này đã được kích hoạt trên một thiết bị khác' 
          }, { status: 403 });
        }
      }

      return NextResponse.json({
        status: 'SUCCESS',
        sessionToken: session.tokenHash,
      });
    }

    return NextResponse.json({
      status: order.status,
    });
  } catch (error: any) {
    console.error('Lỗi khi kiểm tra trạng thái đơn hàng:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
