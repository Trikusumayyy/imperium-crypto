import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import midtransClient from 'midtrans-client';

interface MidtransStatus {
  order_id: string;
  transaction_status: string;
  fraud_status?: string;
}

export async function POST(request: Request) {
  try {
    // 1. Ambil JSON langsung
    const data = await request.json();
    const transactionId = data.transaction_id as string;

    if (!transactionId) {
      console.error('Webhook Error: transaction_id missing', data);
      return NextResponse.json({ error: 'Missing transaction_id' }, { status: 400 });
    }

    // 2. Inisialisasi Midtrans Core API
    const core = new midtransClient.CoreApi({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY || '',
      clientKey: process.env.MIDTRANS_CLIENT_KEY || ''
    });

    // 3. Ambil status resmi dari Midtrans (Sangat Aman)
    const statusResponse = await core.transaction.status(transactionId) as MidtransStatus;
    const { order_id, transaction_status, fraud_status } = statusResponse;

    // 4. Ambil userId (Format: ORDER-timestamp-userId)
    const parts = order_id.split('-');
    const userId: string = parts[parts.length - 1];

    console.log(`Processing Webhook for User: ${userId}, Status: ${transaction_status}`);

    // 5. Cek jika pembayaran berhasil
    if (transaction_status === 'capture' || transaction_status === 'settlement') {
      if (fraud_status === 'accept' || !fraud_status) {
        
        // Update status_aktif di data_member_vip
        const { error: err1 } = await supabaseServer
          .from('data_member_vip')
          .update({ status_aktif: 'aktif' })
          .eq('id_user_auth', userId);

        // Update plan di profiles
        const { error: err2 } = await supabaseServer
          .from('profiles')
          .update({ plan: 'vip' })
          .eq('id', userId);

        // Kirim Notifikasi
        await supabaseServer
          .from('notifications')
          .insert({
            user_id: userId,
            title: 'Pembayaran Sukses!',
            message: 'Selamat! Akun VIP Imperium kamu sudah aktif.',
            type: 'success'
          });

        if (err1 || err2) {
          console.error("Database Update Error:", err1 || err2);
        }
      }
    }

    // WAJIB: Kasih respon 200 supaya Midtrans tidak kirim ulang notifikasi terus-menerus
    return NextResponse.json({ status: 'OK' });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error("Webhook Internal Error:", message);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}