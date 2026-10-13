import AttributeClient from '@/components/admin/AttributeClient';
import { getAttributes } from '@/app/actions/attributeActions';

export const dynamic = 'force-dynamic';

export default async function BrandsPage() {
  const { data: brands } = await getAttributes('brand');
  
  return (
    <div className="w-full space-y-6">
      <AttributeClient initialData={brands || []} type="brand" title="Brands" />
    </div>
  );
}
