import { NextResponse } from 'next/server';
import { getSimulation } from '@/lib/store/simulationStore';

export async function GET(
  request: Request,
  { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
  try {
    const params = await paramsPromise;
    const { id } = params;
    
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    const questions = getSimulation(id);
    if (!questions) return NextResponse.json({ error: 'Not found or expired' }, { status: 404 });
    return NextResponse.json(questions, { status: 200 });
  } catch (err) {
    console.error('/api/simulations/[id] GET error', err);
    return NextResponse.json({ error: 'Internal' }, { status: 500 });
  }
}