import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import midtransClient from 'midtrans-client';

interface MidtransStatus {
  transaction_status: string;
  fraud_status?: string;
  custom_field1?: string; // Tambahkan ini supaya TS kenal
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const transactionId = data.transaction_id as string;

    if (!transactionId) {
      console.error('Webhook Error: transaction_id missing', data);
      return NextResponse.json({ error: 'Missing transaction_id' }, { status: 400 });
    }

    const core = new midtransClient.CoreApi({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY || '',
      clientKey: process.env.MIDTRANS_CLIENT_KEY || ''
    });

    // Ambil status resmi
    const statusResponse = await core.transaction.status(transactionId) as MidtransStatus;
    
    // Ambil data yang dibutuhkan saja (order_id dihapus karena tidak dipakai)
    const { transaction_status, fraud_status, custom_field1 } = statusResponse;

    const userId = custom_field1;

    if (!userId) {
      console.error('Webhook Error: User ID (custom_field1) is missing');
      return NextResponse.json({ error: 'User ID missing' }, { status: 400 });
    }

    console.log(`Processing Webhook for User: ${userId}, Status: ${transaction_status}`);

    if (transaction_status === 'capture' || transaction_status === 'settlement') {
      if (fraud_status === 'accept' || !fraud_status) {
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: err1 } = await (supabaseServer.from('data_member_vip') as any)
          .update({ status_aktif: 'aktif' })
          .eq('id_user_auth', userId);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: err2 } = await (supabaseServer.from('profiles') as any)
          .update({ plan: 'vip' })
          .eq('id', userId);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabaseServer.from('notifications') as any)
          .insert({
            user_id: userId,
            title: 'Pembayaran Sukses!',
            message: 'Selamat! Akun VIP Imperium kamu sudah aktif.',
            type: 'success'
          });

        if (err1 || err2) console.error("Database Update Error:", err1 || err2);
      }
    }

    return NextResponse.json({ status: 'OK' });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error("Webhook Internal Error:", message);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}