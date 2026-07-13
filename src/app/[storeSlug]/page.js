import ShopPageClient from './ShopPageClient';

export default async function Page({ params }) {
  const { storeSlug } = await params;
  return <ShopPageClient storeSlug={storeSlug} />;
}
