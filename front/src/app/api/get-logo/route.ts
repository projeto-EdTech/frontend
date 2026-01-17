import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');

  if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

  // 1. Limpeza do nome (Slug)
  const slugOverrides: { [key: string]: string } = {
    'puc-campinas': 'puccamp',
    'puc campinas': 'puccamp',
    'puc-minas': 'pucmg',
    'puc-goiás': 'pucgo',
    'puc-paraná': 'pucpr',
    'puc-rio': 'pucrio',
    'puc-rs': 'pucrs',
    'puc-sp': 'pucsp',
    'pío décimo': 'Piodecimo',
    'unilasalle-rj': 'unilasallerj'
  };

  const nameLower = name.toLowerCase();
  const slug = slugOverrides[nameLower] || nameLower.replace(/\s+/g, '').replace(/-/g, '');

  // 2. Caminho da pasta
  const logoDirectory = path.join(process.cwd(), 'public', 'Logo_Universidades');
  
  try {
    // 3. Lê todos os arquivos da pasta
    const files = fs.readdirSync(logoDirectory);
    
    // 4. Procura um arquivo que comece com o slug (independente da extensão)
    const foundFile = files.find(file => {
      const fileNameWithoutExt = path.parse(file).name.toLowerCase();
      return fileNameWithoutExt === slug;
    });

    if (foundFile) {
      return NextResponse.json({ path: `/Logo_Universidades/${foundFile}` });
    }

    return NextResponse.json({ error: 'Logo not found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: 'Directory not found' }, { status: 500 });
  }
}
