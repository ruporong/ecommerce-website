import SizeChartClient from './SizeChartClient';
import { getSizeCharts } from '@/app/actions/sizeChartActions';

export const dynamic = 'force-dynamic';

export default async function SizesPage() {
  const { data: sizeCharts } = await getSizeCharts();
  
  return (
    <div className="w-full space-y-6">
      <SizeChartClient initialData={sizeCharts || []} />
    </div>
  );
}
