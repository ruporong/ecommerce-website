import AttributeClient from '@/components/admin/AttributeClient';
import { getAttributes } from '@/app/actions/attributeActions';

export const dynamic = 'force-dynamic';

export default async function TagsPage() {
  const { data: tags } = await getAttributes('tag');
  
  return (
    <div className="w-full space-y-6">
      <AttributeClient initialData={tags || []} type="tag" title="Tags" />
    </div>
  );
}
