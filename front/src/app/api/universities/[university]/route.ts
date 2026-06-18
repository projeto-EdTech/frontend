import { NextResponse } from 'next/server';
import { universities } from '@/lib/data/universities';

export async function GET(
  request: Request,
  { params: paramsPromise }: { params: Promise<{ university: string }> }
) {
  const params = await paramsPromise;
  const universitySlug = params.university.toLowerCase();

  const university = universities.find(
    (u) => u.name.toLowerCase() === universitySlug
  );

  if (!university) {
    return NextResponse.json(
      { error: "Universidade não encontrada" },
      { status: 404 }
    );
  }

  return NextResponse.json(university);
}

/*

import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { university: string } }
) {
  const externalApiUrl = process.env.BACKEND_API_URL;

  if (!externalApiUrl) {
    return NextResponse.json({ error: 'A URL da API externa não está configurada no servidor.' }, { status: 500 });
  }

  const universitySlug = params.university.toLowerCase();

  try {
    // Substitua pela URL real do seu backend externo
    const response = await fetch(`${externalApiUrl}/api/instituicao/${universitySlug}`);

    if (!response.ok) {
      return NextResponse.json(
        { error: "Universidade não encontrada" },
        { status: response.status }
      );
    }

    const university = await response.json();
    return NextResponse.json(university);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar universidade" },
      { status: 500 }
    );
  }
}

*/