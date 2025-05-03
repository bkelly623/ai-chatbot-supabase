import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ProjectHeader } from '@/components/custom/project-header';
import { ProjectChatList } from '@/components/custom/project-chat-list';

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Using await to resolve the params Promise
  const { id } = await params;
  
  const supabase = await createClient();

  // Check if user is logged in
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    redirect('/login');
  }

  // Fetch project details
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  // Show 404 if project doesn't exist or doesn't belong to the user
  if (projectError || !project || project.user_id !== user.id) {
    notFound();
  }

  // Fetch chats for this project
  const { data: chats, error: chatsError } = await supabase
    .from('chats')
    .select('*')
    .eq('project_id', id)
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (chatsError) {
    console.error('Error fetching project chats:', chatsError);
  }

  return (
    <div className="flex flex-col w-full">
      <ProjectHeader project={project} />
      <div className="container max-w-4xl mx-auto p-4">
        <ProjectChatList 
          chats={chats || []} 
          projectId={id} 
          userId={user.id} 
        />
      </div>
    </div>
  );
}
