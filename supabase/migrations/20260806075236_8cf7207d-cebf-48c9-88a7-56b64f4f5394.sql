DROP POLICY IF EXISTS "Anyone can view profile pictures" ON storage.objects;

CREATE POLICY "Authenticated users can view profile pictures"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'profile-pictures');

UPDATE public.profiles
SET profile_picture_url = split_part(split_part(profile_picture_url, '/profile-pictures/', 2), '?', 1)
WHERE profile_picture_url LIKE '%/profile-pictures/%';