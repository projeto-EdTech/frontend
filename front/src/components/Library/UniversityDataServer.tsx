import React from 'react';
import { getUniversities } from '@/app/service/university.service';
import { UniversityLibraryClient } from '@/components/Library/UniversityLibraryClient';

export async function UniversityDataServer() {
  // Fetch data from BFF Java via Service
  const universities = await getUniversities();

  // Pass data to Client Component for filtering, search and pagination
  return <UniversityLibraryClient initialUniversities={universities} />;
}
