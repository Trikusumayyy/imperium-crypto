import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
// Import standar ES6
import midtransClient from 'midtrans-client';

const core = new midtransClient.CoreApi({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY
});

export async function POST(request: Request) {
  const data = await request.json();

  try {
    const statusResponse = await core.transaction.notification(data);
    const orderId = statusResponse.order_id; 
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    // Ambil UserId (INV-TIMESTAMP-USERID)
    const userId = orderId.split('-')[2]; 

    if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
      if (fraudStatus === 'accept') {
        // 1. UPDATE STATUS DI DATABASE
        const { error: dbError } = await supabase
          .from('data_member_vip')
          .update({ status_aktif: 'aktif' as never } as never)
          .eq('id_user_auth', userId);

        if (dbError) {
          console.error("Gagal update status member:", dbError.message);
          return NextResponse.json({ error: 'DB Update Failed' }, { status: 500 });
        }

        // 2. KIRIM NOTIFIKASI REAL KE HP MEMBER
        const { error: notifError } = await supabase.from('notifications').insert({
          user_id: userId,
          title: 'Pembayaran Sukses!',
          message: 'Selamat! Akun VIP Imperium kamu sudah aktif. Silakan cek grup Discord VIP.',
          type: 'success'
        } as never);

        if (notifError) console.error("Gagal kirim notifikasi:", notifError.message);
      }
    }

    return NextResponse.json({ status: 'OK' });
  } catch (err: unknown) {
    // Pakai unknown + type guard untuk hapus error 'any'
    const message = err instanceof Error ? err.message : 'Unknown Webhook Error';
    console.error("Webhook Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}