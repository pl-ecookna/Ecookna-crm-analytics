-- Add RLS policies for prompts table
CREATE POLICY "Only admins can view prompts" 
ON public.prompts 
FOR SELECT 
USING (get_user_role(auth.uid()) = 'admin'::user_role);

CREATE POLICY "Only admins can insert prompts" 
ON public.prompts 
FOR INSERT 
WITH CHECK (get_user_role(auth.uid()) = 'admin'::user_role);

CREATE POLICY "Only admins can update prompts" 
ON public.prompts 
FOR UPDATE 
USING (get_user_role(auth.uid()) = 'admin'::user_role);

CREATE POLICY "Only admins can delete prompts" 
ON public.prompts 
FOR DELETE 
USING (get_user_role(auth.uid()) = 'admin'::user_role);