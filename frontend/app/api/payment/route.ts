import { NextRequest, NextResponse } from 'next/server';
import { PaymentRequest } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: PaymentRequest = await request.json();

    if (!body.bookingId || !body.amount || !body.method) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (body.amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    const paymentId = `PAY${Date.now()}`;
    const isSuccessful = Math.random() > 0.1;

    if (isSuccessful) {
      console.log('Payment processed:', {
        paymentId,
        bookingId: body.bookingId,
        amount: body.amount,
        method: body.method
      });

      return NextResponse.json(
        {
          success: true,
          paymentId,
          bookingId: body.bookingId,
          amount: body.amount,
          status: 'completed',
          message: 'Payment processed successfully',
          transactionDate: new Date().toISOString()
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Payment declined',
          message: 'Your payment could not be processed. Please try again.'
        },
        { status: 402 }
      );
    }
  } catch (error) {
    console.error('Payment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const paymentId = searchParams.get('id');
  const bookingId = searchParams.get('bookingId');

  if (paymentId) {
    const mockPayment = {
      paymentId,
      bookingId: bookingId || 'BK1234567890',
      amount: 20000,
      method: 'card',
      status: 'completed',
      transactionDate: new Date().toISOString()
    };

    return NextResponse.json({ payment: mockPayment });
  }

  return NextResponse.json(
    { error: 'Payment ID required' },
    { status: 400 }
  );
}
