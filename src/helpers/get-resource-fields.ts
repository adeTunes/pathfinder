import { ResourceType } from '@prisma/client';

export function getRequiredFields(type: ResourceType) {
  const payload = {
    type: true,
    title: true,
    coverPhoto: true,
    category: true,
    createdAt: true,
    user: true,
  };
  if (type === 'course') {
    payload['description'] = true;
    payload['studentsEnrolled'] = true;
    payload['price'] = true;
    payload['level'] = true;
    payload['lessons'] = true;
    payload['hasCertifications'] = true;
    payload['studentGraduated'] = true;
  } else {
    payload['content'] = true;
  }
  return payload;
}
