/* eslint-disable */
// @ts-nocheck

import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import midtransClient from 'midtrans-client';

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const core = new midtransClient.CoreApi({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY || '',
      clientKey: process.env.MIDTRANS_CLIENT_KEY || ''
    });

    const statusResponse = await core.transaction.notification(data);
    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    const parts = orderId.split('-');
    const userId = parts[parts.length - 1];

    if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
      if (fraudStatus === 'accept' || !fraudStatus) {
        
        // 1. UPDATE data_member_vip
        const { error: dbError } = await supabaseServer
          .from('data_member_vip')
          .update({ status_aktif: 'aktif' })
          .eq('id_user_auth', userId);

        if (dbError) console.error("DB Error:", dbError.message);

        // 2. UPDATE profiles
        await supabaseServer
          .from('profiles')
          .update({ plan: 'vip' })
          .eq('id', userId);

        // 3. INSERT notifications
        await supabaseServer
          .from('notifications')
          .insert({
            user_id: userId,
            title: 'Pembayaran Sukses!',
            message: 'Selamat! Akun VIP Imperium kamu sudah aktif.',
            type: 'success'
          });
      }
    }

    return NextResponse.json({ status: 'OK' });
  } catch (err: any) {
    console.error("Webhook Error:", err?.message);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}