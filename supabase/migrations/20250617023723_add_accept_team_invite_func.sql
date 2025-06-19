-- 1. Function to handle invite on profile creation
CREATE OR REPLACE FUNCTION public.handle_profile_invite()
RETURNS TRIGGER AS $$
DECLARE
  invite_id UUID;
  team_id UUID;
  invite_code TEXT;
BEGIN
  -- Get invite_code from auth.users metadata
  SELECT (raw_user_meta_data->>'invite_code') INTO invite_code
  FROM auth.users
  WHERE id = NEW.id;

  IF invite_code IS NOT NULL THEN
    -- Validate invite
    SELECT id, team_id INTO invite_id, team_id
    FROM public.team_invites
    WHERE verification_code = invite_code
      AND email = NEW.email
      AND status = 'pending'
    LIMIT 1;

    IF invite_id IS NULL THEN
      RAISE EXCEPTION 'Invalid or expired invite code';
    END IF;

    -- Create team member
    INSERT INTO public.team_members (team_id, user_id, role, status)
    VALUES (team_id, NEW.id, 'member', 'active');

    -- Mark invite as accepted
    UPDATE public.team_invites
    SET status = 'accepted'
    WHERE id = invite_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
SET search_path = public;

-- 2. Trigger to call the function after a profile is created
DROP TRIGGER IF EXISTS handle_profile_invite_trigger ON public.profiles;

CREATE TRIGGER handle_profile_invite_trigger
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_profile_invite();
