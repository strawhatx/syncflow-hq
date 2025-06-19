-- 1. Function to add the team creator as an owner in team_members
CREATE OR REPLACE FUNCTION public.add_team_owner_member()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.team_members (team_id, user_id, role, status)
  VALUES (NEW.id, NEW.created_by, 'owner', 'active');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
SET search_path = public;

-- 2. Trigger to call the function after a team is created
CREATE TRIGGER add_team_owner_member_trigger
AFTER INSERT ON public.teams
FOR EACH ROW
EXECUTE FUNCTION public.add_team_owner_member();