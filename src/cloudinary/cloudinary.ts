import { v2 } from 'cloudinary';

export const CloudinaryProvider = {
  provide: 'CLOUDINARY',
  useFactory: () => {
    return v2.config({
      cloud_name: "dc0zfjjea",
      api_key: "914681137242671",
      api_secret: "l7-cMPnPLZl4dXD482126-Jpa64"
    });
  },
};
