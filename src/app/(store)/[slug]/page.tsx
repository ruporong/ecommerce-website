import connectToDatabase from '@/lib/mongodb';
import PageModel from '@/models/Page';
import { notFound } from 'next/navigation';

export default async function DynamicPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  await connectToDatabase();
  const page = await PageModel.findOne({ slug: resolvedParams.slug, status: 'published' }).lean();

  if (!page) {
    notFound();
  }

  return (
    <main className="py-20 md:py-32 px-4 md:px-8 max-w-[1000px] mx-auto min-h-[60vh]">
      <h1 className="font-serif text-4xl md:text-6xl mb-10 border-b border-gray-200 pb-6">{page.title}</h1>
      <div 
        className="text-charcoal/80 leading-relaxed space-y-6 [&>h1]:text-3xl [&>h1]:font-serif [&>h1]:mb-4 [&>h2]:text-2xl [&>h2]:font-serif [&>h2]:mb-4 [&>h3]:text-xl [&>h3]:font-serif [&>h3]:mb-3 [&>p]:mb-4 [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-4 [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-4 [&>a]:text-dusty-rose [&>a]:underline"
        dangerouslySetInnerHTML={{ __html: page.content }}
      />
    </main>
  );
}
