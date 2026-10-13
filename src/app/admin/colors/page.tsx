import AttributeClient from '@/components/admin/AttributeClient';
import { getAttributes } from '@/app/actions/attributeActions';

export const dynamic = 'force-dynamic';

export default async function ColorsPage() {
  const { data: colors } = await getAttributes('color');
  
  return (
    <div className="w-full space-y-6">
      <AttributeClient initialData={colors || []} type="color" title="Colors" />
    </div>
  );
}
