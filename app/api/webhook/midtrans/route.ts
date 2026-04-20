import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import midtransClient from 'midtrans-client';

interface DataMemberVIPUpdate {
  status_aktif: string;
}

interface ProfilesUpdate {
  plan: string;
}

interface NotificationInsert {
  user_id: string | null;
  title: string;
  message: string;
  type: 'signal' | 'success' | 'alert' | 'info';
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    let data: Record<string, unknown> = {};

    try {
      data = JSON.parse(rawBody || '{}');
    } catch {
      data = Object.fromEntries(new URLSearchParams(rawBody));
    }

    const transactionId = typeof data.transaction_id === 'string' ? data.transaction_id : undefined;
    if (!transactionId) {
      console.error('Webhook Error: transaction_id missing from Midtrans payload', data);
      return NextResponse.json({ error: 'Missing transaction_id' }, { status: 400 });
    }

    const core = new midtransClient.CoreApi({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY || '',
      clientKey: process.env.MIDTRANS_CLIENT_KEY || ''
    });

    const statusResponse = await core.transaction.status(transactionId);
    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    const parts = orderId.split('-');
    const userId = parts[parts.length - 1];

    if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
      if (fraudStatus === 'accept' || !fraudStatus) {
        
        // 1. UPDATE data_member_vip
        const { error: dbError } = await (supabaseServer.from('data_member_vip') as unknown as {
          update: (values: DataMemberVIPUpdate) => {
            eq: (col: string, val: string) => Promise<{ error: Error | null }>;
          };
        })
          .update({ status_aktif: 'aktif' })
          .eq('id_user_auth', userId);

        if (dbError) console.error("DB Error:", dbError.message);

        // 2. UPDATE profiles
        await (supabaseServer.from('profiles') as unknown as {
          update: (values: ProfilesUpdate) => {
            eq: (col: string, val: string) => Promise<{ error: Error | null }>;
          };
        })
          .update({ plan: 'vip' })
          .eq('id', userId);

        // 3. INSERT notifications
        await (supabaseServer.from('notifications') as unknown as {
          insert: (values: NotificationInsert) => Promise<{ error: Error | null }>;
        })
          .insert({
            user_id: userId,
            title: 'Pembayaran Sukses!',
            message: 'Selamat! Akun VIP Imperium kamu sudah aktif.',
            type: 'success'
          });
      }
    }

    return NextResponse.json({ status: 'OK' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : JSON.stringify(err);
    console.error("Webhook Error:", message);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}