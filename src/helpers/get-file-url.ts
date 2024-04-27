import { Request } from 'express';

export const getFileUrl = (req: Request, fileName: string) => {
  const fileUrl = `${req.protocol}://${req.get('host')}/public/${fileName}`;
  return fileUrl;
};
