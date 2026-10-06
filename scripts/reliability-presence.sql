-- Read only the presence of submitted media, without exposing their URLs.
select row_to_json(q) from (
  select companion_id, email_verified, profile_completed, document_verified,
    document_status, photo_verified, photo_status, video_verified, video_status,
    media_comparison_verified, media_comparison_status,
    case when coalesce(document_front_url, '') <> '' then 'submitted' end as document_front_url,
    case when coalesce(document_back_url, '') <> '' then 'submitted' end as document_back_url,
    case when coalesce(verification_video_url, '') <> '' then 'submitted' end as verification_video_url,
    case when coalesce(media_comparison_video_url, '') <> '' then 'submitted' end as media_comparison_video_url,
    case when exists(select 1 from unnest(verification_photos) p where p not like 'gesture-selfie::%') then array['submitted'] else array[]::text[] end as verification_photos
  from public.companion_verifications order by updated_at desc, created_at desc
) q;
