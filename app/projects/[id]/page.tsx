import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

import { DEFAULT_MODEL_NAME, models } from '@/ai/models';
import ProjectDetail from '@/components/custom/project-detail';
import { getSession } from '@/db/cached-queries';
import { createServerClient } from '@/lib/supabase/server';

export default async function ProjectPage({
  params
}: {
  params: { id: string };
}) {
  const { id } = params;
  
  // Get the user session
  const user = await getSession();

  if (!user) {
    return notFound();
  }

  // Fetch the project data
  const supabase = createServerClient();
  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !project) {
    console.error('Error fetching project:', error);
    return notFound();
  }

  // Ensure the user owns this project
  if (user.id !== project.user_id) {
    return notFound();
  }

  // Get the selected model from cookies
  const cookieStore = cookies();
  const modelIdFromCookie = cookieStore.get('model-id')?.value;
  const selectedModelId =
    models.find((model) => model.id === modelIdFromCookie)?.id ||
    DEFAULT_MODEL_NAME;

  return (
    <ProjectDetail 
      id={project.id} 
      name={project.name}
      user={user}
      selectedModelId={selectedModelId}
    />
  );
}
