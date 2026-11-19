import sanityClient from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

// Read-only client. The dataset is public, so no token is needed (or allowed) here:
// anything in browser code is visible to every visitor. The contact form
// goes through public/contact.php instead.
export const client = sanityClient({
  projectId: process.env.REACT_APP_SANITY_PROJECT_ID || 'd0kna1ey',
  dataset: 'production',
  apiVersion: '2022-02-01',
  useCdn: true,
});

const builder = imageUrlBuilder(client);

export const urlFor = (source) => builder.image(source);
