import { NextRequest, NextResponse } from 'next/server';
import { BookingRequest, Booking } from '@/types';
import { calculateIntercityPrice, calculateAirportPrice, calculateHourlyPrice } from '@/lib/pricing';

export async function POST(request: NextRequest) {
  try {
    const body: BookingRequest = await request.json();

    if (!body.from || !body.to || !body.date || !body.time || !body.serviceType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let totalPrice = 0;

    switch (body.serviceType) {
      case 'intercity':
        const routeId = `${body.from.toLowerCase().substring(0, 3)}-${body.to.toLowerCase().substring(0, 3)}`;
        totalPrice = calculateIntercityPrice(routeId, body.passengers || 1);
        break;

      case 'airport':
        totalPrice = calculateAirportPrice(
          body.from,
          body.to,
          body.vehicleClass || 'business'
        );
        break;

      case 'hourly':
        totalPrice = calculateHourlyPrice(
          body.hours || 3,
          body.vehicleClass || 'business'
        );
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid service type' },
          { status: 400 }
        );
    }

    const booking: Booking = {
      id: `BK${Date.now()}`,
      bookingRequest: body,
      status: 'pending',
      totalPrice,
      createdAt: new Date().toISOString()
    };

    console.log('New booking created:', booking);

    return NextResponse.json(
      {
        success: true,
        booking,
        message: 'Booking request received successfully'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Booking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const bookingId = searchParams.get('id');

  if (bookingId) {
    const mockBooking: Booking = {
      id: bookingId,
      bookingRequest: {
        from: 'Moscow',
        to: 'Saint Petersburg',
        date: '2026-05-15',
        time: '10:00',
        passengers: 2,
        serviceType: 'intercity'
      },
      status: 'confirmed',
      totalPrice: 20000,
      createdAt: new Date().toISOString()
    };

    return NextResponse.json({ booking: mockBooking });
  }

  const mockBookings: Booking[] = [
    {
      id: 'BK1234567890',
      bookingRequest: {
        from: 'Moscow',
        to: 'Saint Petersburg',
        date: '2026-05-15',
        time: '10:00',
        passengers: 2,
        serviceType: 'intercity'
      },
      status: 'confirmed',
      totalPrice: 20000,
      createdAt: new Date().toISOString()
    }
  ];

  return NextResponse.json({ bookings: mockBookings });
}
