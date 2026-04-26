import React from 'react';
import LibraryUniversityClient from './LibraryUniversityClient';
import { getUniversityBySlug } from '@/app/service/university.service';

interface LibraryUniversityDataServerProps {
  slug: string;
}

export default async function LibraryUniversityDataServer({ slug }: LibraryUniversityDataServerProps) {
  const universityInfo = await getUniversityBySlug(slug);

  return <LibraryUniversityClient slug={slug} universityInfo={universityInfo} />;
}
