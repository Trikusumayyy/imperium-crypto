import { NextResponse } from 'next/server';
import midtransClient from 'midtrans-client';

export async function POST(request: Request) {
  try {
    const { userId, email, nama, harga, paket } = await request.json();
console.log("DEBUG_KEY:", process.env.MIDTRANS_SERVER_KEY?.substring(0, 7) + "...");
    const snap = new midtransClient.Snap({
      isProduction: true,
      serverKey: process.env.MIDTRANS_SERVER_KEY || '',
      clientKey: process.env.MIDTRANS_CLIENT_KEY || ''
    });

    // Buat parameter transaksi
    // Tips: Simpan userId di dalam order_id supaya nanti mudah di-split di webhook
  const parameter = {
      transaction_details: {
        // order_id jadi pendek (maks 50 char)
        order_id: `IMP-${Date.now()}`, 
        gross_amount: harga,
      },
      // userId disimpan di sini, aman dan tidak ada batas karakter pendek
      custom_field1: userId, 
      customer_details: {
        first_name: nama,
        email: email,
      },
      item_details: [{
        name: paket,
        price: harga,
        quantity: 1
      }]
    };

    const transaction = await snap.createTransaction(parameter);
    
    // Kirim TOKEN-nya ke frontend
    return NextResponse.json({ token: transaction.token });
    
  } catch (error) {
    console.error("Checkout Error:", error);
    return NextResponse.json({ error: "Gagal membuat transaksi" }, { status: 500 });
  }
}